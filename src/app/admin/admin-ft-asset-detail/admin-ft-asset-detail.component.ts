import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {ActivatedRoute} from '@angular/router'
import {filter, map, mergeMap, switchMap} from 'rxjs/operators'
import {MetaService} from '../../shared/services/meta.service'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {FtAssetService, FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-admin-ft-asset-detail',
  templateUrl: './admin-ft-asset-detail.component.html',
  styleUrls: ['./admin-ft-asset-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFtAssetDetailComponent {
  assetSub = new BehaviorSubject<void>(undefined)
  asset$: Observable<WithStatus<FtAssetWithInfo>>
  campaigns$: Observable<WithStatus<CampaignWithInfo[]>>

  constructor(private ftAssetService: FtAssetService,
              private campaignService: CampaignService,
              private metaService: MetaService,
              private route: ActivatedRoute) {
    const assetId = this.route.snapshot.params.id

    this.asset$ = this.assetSub.asObservable().pipe(
      switchMap(() => withStatus(
        this.ftAssetService.getAddressByName(assetId).pipe(
          switchMap(address => this.ftAssetService.getAssetWithInfo(address)),
        ),
      )),
    )
    this.campaigns$ = this.asset$.pipe(
      filter(asset => !!asset.value),
      map(asset => asset.value!.contractAddress),
      mergeMap(assetContractAddress => withStatus(this.campaignService.getCampaigns(assetContractAddress))),
    )
  }
}
