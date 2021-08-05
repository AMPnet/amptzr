import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-campaign-detail',
  templateUrl: './campaign-detail.component.html',
  styleUrls: ['./campaign-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDetailComponent {
  constructor() {
  }
}
