import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { WithStatus, withStatus } from '../../shared/utils/observables'
import {
  CampaignService,
  CampaignWithInfo,
} from '../../shared/services/blockchain/campaign/campaign.service'
import { CampaignCommonStateWithName } from '../../shared/services/blockchain/query.service'

@Component({
  selector: 'app-offers-card',
  templateUrl: './offers-card.component.html',
  styleUrls: ['./offers-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersCardComponent implements OnChanges {
  @Input() campaign!: CampaignCommonStateWithName
  @Input() size: 'small' | 'large' = 'large'

  campaignSub = new Subject<CampaignCommonStateWithName>()
  campaign$: Observable<
    WithStatus<CampaignCommonStateWithName & CampaignWithInfo>
  > = this.campaignSub
    .asObservable()
    .pipe(
      switchMap((state) =>
        withStatus(
          this.campaignService
            .getCampaignInfo(state.campaign)
            .pipe(
              map((campaignWithState) => ({ ...state, ...campaignWithState }))
            )
        )
      )
    )

  constructor(private campaignService: CampaignService) {}

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.campaignSub.next(
        changes.campaign.currentValue as CampaignCommonStateWithName
      )
    })
  }
}
