import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {map} from 'rxjs/operators'
import {ActivatedRoute} from '@angular/router'
import {SessionQuery} from '../../session/state/session.query'

@Component({
  selector: 'app-campaign-detail',
  templateUrl: './campaign-detail.component.html',
  styleUrls: ['./campaign-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDetailComponent {
  campaign$: Observable<WithStatus<CampaignWithInfo>>
  address$ = this.sessionQuery.address$.pipe(
    map(value => ({value: value})),
  )

  constructor(private route: ActivatedRoute,
              private campaignService: CampaignService,
              private sessionQuery: SessionQuery) {
    const campaignAddress = this.route.snapshot.params.id
    this.campaign$ = withStatus(this.campaignService.getCampaignWithInfo(campaignAddress))
  }
}
