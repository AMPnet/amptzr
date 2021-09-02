import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {Observable} from 'rxjs'
import {WithStatus} from '../../shared/utils/observables'
import {CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'

@Component({
  selector: 'app-admin-campaign-list',
  templateUrl: './admin-campaign-list.component.html',
  styleUrls: ['./admin-campaign-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCampaignListComponent {
  @Input() campaigns$!: Observable<WithStatus<CampaignWithInfo[]>>

  constructor() {
  }
}
