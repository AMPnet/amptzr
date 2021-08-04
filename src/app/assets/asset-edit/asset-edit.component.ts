import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-asset-edit',
  templateUrl: './asset-edit.component.html',
  styleUrls: ['./asset-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetEditComponent {
  constructor() {
  }
}
