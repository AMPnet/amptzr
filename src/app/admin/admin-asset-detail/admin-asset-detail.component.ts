import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {ActivatedRoute} from '@angular/router'
import {filter, map, mergeMap, switchMap} from 'rxjs/operators'
import {MetaService} from '../../shared/services/meta.service'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {resolveAddress} from '../../shared/utils/ethersjs'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset/asset.service'

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
        // TODO: fix resolve address via name service
        resolveAddress(assetId, this.assetService.getAddressByName(assetId)).pipe(
          switchMap(address => this.assetService.getAssetWithInfo(address)),
        ),
      )),
    )
    this.campaigns$ = this.asset$.pipe(
      filter(asset => !!asset.value),
      map(asset => asset.value!.contractAddress),
      // TODO: fetch campaigns from query service
      mergeMap(assetContractAddress => withStatus(this.campaignService.getCampaigns(assetContractAddress))),
    )
  }
}
