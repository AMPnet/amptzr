import {ChangeDetectionStrategy, Component} from '@angular/core'
import {combineLatest, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {ActivatedRoute} from '@angular/router'
import {map, switchMap} from 'rxjs/operators'
import {BigNumber} from "ethers"
import {resolveAddress} from '../../shared/utils/ethersjs'

@Component({
  selector: 'app-admin-asset-campaign-add-tokens',
  templateUrl: './admin-asset-campaign-add-tokens.component.html',
  styleUrls: ['./admin-asset-campaign-add-tokens.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetCampaignAddTokensComponent {
  assetData$: Observable<WithStatus<{
    asset: AssetWithInfo,
    balance: BigNumber,
  }>>
  campaign$: Observable<WithStatus<CampaignWithInfo>>

  constructor(public assetService: AssetService,
              private campaignService: CampaignService,
              private route: ActivatedRoute,) {
    const assetId = this.route.snapshot.params.assetId
    const asset$ = resolveAddress(assetId, this.assetService.getAddressByName(assetId)).pipe(
      switchMap(address => this.assetService.getAssetWithInfo(address, true)),
    )
    const tokenBalance$ = asset$.pipe(
      switchMap(asset => this.assetService.balance(asset.contractAddress)),
    )

    this.assetData$ = withStatus(
      combineLatest([
        asset$,
        tokenBalance$,
      ]).pipe(
        map(([asset, balance]) => ({asset, balance})),
      ),
    )

    const campaignID = this.route.snapshot.params.campaignId
    this.campaign$ = withStatus(
      resolveAddress(campaignID, this.campaignService.getAddressByName(campaignID)).pipe(
        switchMap(address => this.campaignService.getCampaignWithInfo(address, true))
      )
    )
  }
}
