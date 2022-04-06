import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-claims',
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimsComponent {
  constructor() {
  }
}
