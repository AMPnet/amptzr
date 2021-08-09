import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {CampaignService, CampaignWithInfo} from '../shared/services/blockchain/campaign.service'
import {ActivatedRoute} from '@angular/router'
import {switchMap} from 'rxjs/operators'
import {WithStatus, withStatus} from '../shared/utils/observables'

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferComponent {
  campaign$: Observable<WithStatus<CampaignWithInfo>>

  constructor(private campaignService: CampaignService,
              private route: ActivatedRoute) {
    const campaignID = this.route.snapshot.params.id

    this.campaign$ = withStatus(
      this.campaignService.getAddressByName(campaignID).pipe(
        switchMap(address => this.campaignService.getCampaignWithInfo(address)),
      ),
    )
  }
}
