import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core'
import {CampaignService, CampaignState, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {Observable, Subject} from 'rxjs'
import {switchMap} from 'rxjs/operators'

@Component({
  selector: 'app-offers-card-large',
  templateUrl: './offers-card-large.component.html',
  styleUrls: ['./offers-card-large.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersCardLargeComponent implements OnChanges {
  @Input() campaign!: CampaignState

  campaignSub = new Subject<CampaignState>()
  campaign$: Observable<CampaignWithInfo> = this.campaignSub.asObservable().pipe(
    switchMap(state => this.campaignService.getCampaignInfo(state)),
  )

  constructor(private campaignService: CampaignService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.campaignSub.next(changes.campaign.currentValue as CampaignState)
    })
  }
}
