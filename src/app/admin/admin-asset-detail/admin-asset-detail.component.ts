import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { withStatus, WithStatus } from '../../shared/utils/observables'
import { ActivatedRoute } from '@angular/router'
import { filter, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'
import { MetaService } from '../../shared/services/meta.service'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../../shared/services/blockchain/asset/asset.service'
import {
  CampaignService,
  CampaignWithInfo,
} from '../../shared/services/blockchain/campaign/campaign.service'
import { NameService } from '../../shared/services/blockchain/name.service'
import { QueryService } from '../../shared/services/blockchain/query.service'

@Component({
  selector: 'app-admin-asset-detail',
  templateUrl: './admin-asset-detail.component.html',
  styleUrls: ['./admin-asset-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetDetailComponent {
  assetSub = new BehaviorSubject<void>(undefined)
  asset$: Observable<WithStatus<CommonAssetWithInfo>>
  campaigns$: Observable<WithStatus<CampaignWithInfo[]>>

  constructor(
    private assetService: AssetService,
    private campaignService: CampaignService,
    private nameService: NameService,
    private queryService: QueryService,
    private metaService: MetaService,
    private route: ActivatedRoute
  ) {
    const assetId = this.route.snapshot.params.id

    this.asset$ = withStatus(
      this.nameService.getAsset(assetId).pipe(
        switchMap((asset) =>
          this.assetService.getAssetWithInfo(asset.asset.contractAddress, true)
        ),
        shareReplay(1)
      )
    )

    this.campaigns$ = this.asset$.pipe(
      filter((asset) => !!asset.value),
      map((asset) => asset.value!.contractAddress),
      mergeMap((address) =>
        withStatus(
          this.queryService
            .getCampaignsForAssetAddress(address)
            .pipe(
              switchMap((campaigns) =>
                campaigns.length > 0
                  ? combineLatest(
                      campaigns.map((campaign) =>
                        this.campaignService.getCampaignInfo(campaign.campaign)
                      )
                    )
                  : of([])
              )
            )
        )
      )
    )
  }
}
