import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {Observable} from 'rxjs'
import {WithStatus} from '../../shared/utils/observables'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-admin-asset-list',
  templateUrl: './admin-asset-list.component.html',
  styleUrls: ['./admin-asset-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetListComponent {
  @Input() title!: string
  @Input() assetType!: 'asset' | 'ft-asset'
  @Input() assets$!: Observable<WithStatus<(AssetWithInfo | FtAssetWithInfo)[]>>

  constructor() {
  }
}
