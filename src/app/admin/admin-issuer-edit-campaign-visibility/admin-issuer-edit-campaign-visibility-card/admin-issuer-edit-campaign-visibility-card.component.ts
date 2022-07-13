import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { withStatus, WithStatus } from '../../../shared/utils/observables'
import { map, switchMap } from 'rxjs/operators'
import { CampaignCommonStateWithName } from '../../../shared/services/blockchain/query.service'
import {
  CampaignService,
  CampaignWithInfo,
} from '../../../shared/services/blockchain/campaign/campaign.service'

@Component({
  selector: 'app-admin-issuer-edit-campaign-visibility-card',
  templateUrl: './admin-issuer-edit-campaign-visibility-card.component.html',
  styleUrls: ['./admin-issuer-edit-campaign-visibility-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIssuerEditCampaignVisibilityCardComponent
  implements OnChanges, OnInit
{
  @Input() offer!: CampaignCommonStateWithName
  @Input() isHidden!: boolean
  @Output() campaignVisibilityChange: EventEmitter<CampaignVisibility> =
    new EventEmitter<CampaignVisibility>()

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

  ngOnInit() {
    this.campaignVisibilityChange.next({
      campaignAddress: this.offer.campaign.contractAddress,
      isHidden: this.isHidden,
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.campaignSub.next(
        changes.offer.currentValue as CampaignCommonStateWithName
      )
    })
  }

  toggleCampaignVisibility() {
    this.isHidden = !this.isHidden
    this.campaignVisibilityChange.next({
      campaignAddress: this.offer.campaign.contractAddress,
      isHidden: this.isHidden,
    })
  }
}

export interface CampaignVisibility {
  campaignAddress: string
  isHidden: boolean
}
