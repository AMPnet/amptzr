import {ChangeDetectionStrategy, Component} from '@angular/core'
import {combineLatest, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {ActivatedRoute} from '@angular/router'
import {map, switchMap} from 'rxjs/operators'
import {FtAssetService, FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'
import {BigNumber} from "ethers"

@Component({
  selector: 'app-admin-ft-asset-campaign-add-tokens',
  templateUrl: './admin-ft-asset-campaign-add-tokens.component.html',
  styleUrls: ['./admin-ft-asset-campaign-add-tokens.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFtAssetCampaignAddTokensComponent {
  assetData$: Observable<WithStatus<{
    asset: FtAssetWithInfo,
    balance: BigNumber,
  }>>
  campaign$: Observable<WithStatus<CampaignWithInfo>>

  constructor(public ftAssetService: FtAssetService,
              private campaignService: CampaignService,
              private route: ActivatedRoute,) {
    const assetId = this.route.snapshot.params.assetId
    const asset$ = this.ftAssetService.getAddressByName(assetId).pipe(
      switchMap(address => this.ftAssetService.getAssetWithInfo(address, true)),
    )
    const tokenBalance$ = asset$.pipe(
      switchMap(asset => this.ftAssetService.balance(asset.contractAddress)),
    )

    this.assetData$ = withStatus(
      combineLatest([
        asset$,
        tokenBalance$,
      ]).pipe(
        map(([asset, balance]) => ({asset, balance})),
      ),
    )
    const campaignId = this.route.snapshot.params.campaignId
    this.campaign$ = withStatus(
      this.campaignService.getAddressByName(campaignId).pipe(
        switchMap(address => this.campaignService.getCampaignWithInfo(address, true))
      )
    )
  }
}
