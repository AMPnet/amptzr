import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {ActivatedRoute} from '@angular/router'
import {CampaignService, CampaignWithInfo} from '../../../shared/services/blockchain/campaign.service'
import {WithStatus, withStatus} from '../../../shared/utils/observables'
import {AssetService, AssetWithInfo} from '../../../shared/services/blockchain/asset.service'
import {SessionQuery} from '../../../session/state/session.query'

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDetailComponent {
  asset$: Observable<WithStatus<AssetWithInfo>>
  campaigns$: Observable<WithStatus<CampaignWithInfo[]>>
  address$ = this.sessionQuery.address$.pipe(
    map(value => ({value: value})),
  )

  constructor(private route: ActivatedRoute,
              private assetService: AssetService,
              private campaignService: CampaignService,
              private sessionQuery: SessionQuery) {
    const assetAddress = this.route.snapshot.params.id
    this.asset$ = withStatus(this.assetService.getAssetWithInfo(assetAddress))
    this.campaigns$ = withStatus(this.campaignService.getCampaigns(assetAddress))
  }
}
