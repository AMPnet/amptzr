import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core'
import {CampaignService, CampaignState, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {Observable, Subject} from 'rxjs'
import {switchMap} from 'rxjs/operators'
import {WithStatus, withStatus} from '../../shared/utils/observables'

@Component({
  selector: 'app-offers-card',
  templateUrl: './offers-card.component.html',
  styleUrls: ['./offers-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersCardComponent implements OnChanges {
  @Input() campaign!: CampaignState
  @Input() size: 'small' | 'large' = 'large'

  campaignSub = new Subject<CampaignState>()
  campaign$: Observable<WithStatus<CampaignWithInfo>> = this.campaignSub.asObservable().pipe(
    switchMap(state => withStatus(this.campaignService.getCampaignInfo(state))),
  )

  constructor(private campaignService: CampaignService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.campaignSub.next(changes.campaign.currentValue as CampaignState)
    })
  }
}
