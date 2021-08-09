import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-asset-campaign-new',
  templateUrl: './asset-campaign-new.component.html',
  styleUrls: ['./asset-campaign-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetCampaignNewComponent {
  constructor() {
  }
}
