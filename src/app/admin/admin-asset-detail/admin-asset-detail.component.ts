import {ChangeDetectionStrategy, Component} from '@angular/core'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {BehaviorSubject, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {ActivatedRoute} from '@angular/router'
import {filter, map, mergeMap, switchMap} from 'rxjs/operators'
import {MetaService} from '../../shared/services/meta.service'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'

@Component({
  selector: 'app-admin-asset-detail',
  templateUrl: './admin-asset-detail.component.html',
  styleUrls: ['./admin-asset-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetDetailComponent {
  assetSub = new BehaviorSubject<void>(undefined)
  asset$: Observable<WithStatus<AssetWithInfo>>
  campaigns$: Observable<WithStatus<CampaignWithInfo[]>>

  constructor(private assetService: AssetService,
              private campaignService: CampaignService,
              private metaService: MetaService,
              private route: ActivatedRoute) {
    const assetId = this.route.snapshot.params.id

    this.asset$ = this.assetSub.asObservable().pipe(
      switchMap(() => withStatus(
        this.assetService.getAddressByName(assetId).pipe(
          switchMap(address => this.assetService.getAssetWithInfo(address)),
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
