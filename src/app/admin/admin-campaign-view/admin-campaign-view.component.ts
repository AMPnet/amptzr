import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-admin-campaign-view',
  templateUrl: './admin-campaign-view.component.html',
  styleUrls: ['./admin-campaign-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignViewComponent {
  @Input() campaign!: CampaignWithInfo
  @Input() asset!: AssetWithInfo | FtAssetWithInfo

  constructor() {
  }
}
