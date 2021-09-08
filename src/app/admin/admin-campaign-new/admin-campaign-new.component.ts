import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-admin-campaign-new',
  templateUrl: './admin-campaign-new.component.html',
  styleUrls: ['./admin-campaign-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignNewComponent {

  constructor() {
  }
}
