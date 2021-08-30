import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {ActivatedRoute} from '@angular/router'
import {CampaignService, CampaignWithInfo} from '../../../shared/services/blockchain/campaign.service'
import {WithStatus, withStatus} from '../../../shared/utils/observables'
import {SessionQuery} from '../../../session/state/session.query'
import {FtAssetService, FtAssetWithInfo} from '../../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-ft-asset-detail',
  templateUrl: './ft-asset-detail.component.html',
  styleUrls: ['./ft-asset-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FtAssetDetailComponent {
  asset$: Observable<WithStatus<FtAssetWithInfo>>
  campaigns$: Observable<WithStatus<CampaignWithInfo[]>>
  address$ = this.sessionQuery.address$.pipe(
    map(value => ({value: value})),
  )

  constructor(private route: ActivatedRoute,
              private ftAssetService: FtAssetService,
              private campaignService: CampaignService,
              private sessionQuery: SessionQuery) {
    const assetAddress = this.route.snapshot.params.id
    this.asset$ = withStatus(this.ftAssetService.getAssetWithInfo(assetAddress))
    this.campaigns$ = withStatus(this.campaignService.getCampaigns(assetAddress))
  }
}
