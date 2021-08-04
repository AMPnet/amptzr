import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDetailComponent {
  constructor() {
  }
}
