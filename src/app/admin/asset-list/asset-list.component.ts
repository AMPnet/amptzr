import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {Observable} from 'rxjs'
import {WithStatus} from '../../shared/utils/observables'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetListComponent {
  @Input() title!: string
  @Input() assets$!: Observable<WithStatus<(AssetWithInfo | FtAssetWithInfo)[]>>

  constructor() {
  }
}
