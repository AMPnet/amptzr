import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core'

@Component({
  selector: 'app-campaign-edit',
  templateUrl: './campaign-edit.component.html',
  styleUrls: ['./campaign-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignEditComponent {
  constructor() {
  }
}
