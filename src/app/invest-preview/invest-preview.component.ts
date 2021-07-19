import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-invest-preview',
  templateUrl: './invest-preview.component.html',
  styleUrls: ['./invest-preview.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestPreviewComponent {
  constructor() {
  }
}
