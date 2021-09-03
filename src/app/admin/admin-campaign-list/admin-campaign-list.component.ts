import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {Observable} from 'rxjs'
import {WithStatus} from '../../shared/utils/observables'
import {CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-admin-campaign-list',
  templateUrl: './admin-campaign-list.component.html',
  styleUrls: ['./admin-campaign-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCampaignListComponent {
  @Input() asset!: AssetWithInfo | FtAssetWithInfo
  @Input() campaigns$!: Observable<WithStatus<CampaignWithInfo[]>>

  constructor() {
  }
}
