import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-payouts',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutsComponent {
  constructor() {
  }
}
