import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {ActivatedRoute} from '@angular/router'
import {switchMap} from 'rxjs/operators'

@Component({
  selector: 'app-admin-asset-campaign-view',
  templateUrl: './admin-asset-campaign-view.component.html',
  styleUrls: ['./admin-asset-campaign-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetCampaignViewComponent {
  asset$: Observable<WithStatus<AssetWithInfo>>
  campaign$: Observable<WithStatus<CampaignWithInfo>>

  constructor(private assetService: AssetService,
              private campaignService: CampaignService,
              private route: ActivatedRoute,) {
    const assetId = this.route.snapshot.params.assetId
    this.asset$ = withStatus(
      this.assetService.getAddressByName(assetId).pipe(
        switchMap(address => this.assetService.getAssetWithInfo(address)),
      ))
    const campaignId = this.route.snapshot.params.campaignId
    this.campaign$ = withStatus(
      this.campaignService.getAddressByName(campaignId).pipe(
        switchMap(address => this.campaignService.getCampaignWithInfo(address))
      )
    )
  }
}
