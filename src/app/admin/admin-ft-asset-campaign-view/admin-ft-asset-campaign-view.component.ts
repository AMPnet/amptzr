import {ChangeDetectionStrategy, Component} from '@angular/core'
import {combineLatest, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {ActivatedRoute} from '@angular/router'
import {map, switchMap} from 'rxjs/operators'
import {FtAssetService, FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'
import {BigNumber} from "ethers"
import {resolveAddress} from '../../shared/utils/ethersjs'

@Component({
  selector: 'app-admin-ft-asset-campaign-view',
  templateUrl: './admin-ft-asset-campaign-view.component.html',
  styleUrls: ['./admin-ft-asset-campaign-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFtAssetCampaignViewComponent {
  assetData$: Observable<WithStatus<{
    asset: FtAssetWithInfo,
    balance: BigNumber,
  }>>
  campaign$: Observable<WithStatus<CampaignWithInfo>>

  constructor(private ftAssetService: FtAssetService,
              private campaignService: CampaignService,
              private route: ActivatedRoute) {
    const assetId = this.route.snapshot.params.assetId
    const asset$ = resolveAddress(assetId, this.ftAssetService.getAddressByName(assetId)).pipe(
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
      resolveAddress(campaignId, this.campaignService.getAddressByName(campaignId)).pipe(
        switchMap(address => this.campaignService.getCampaignWithInfo(address, true)),
      ),
    )
  }
}
