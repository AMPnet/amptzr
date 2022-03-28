import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-payouts-payout-show',
  templateUrl: './payouts-payout-show.component.html',
  styleUrls: ['./payouts-payout-show.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutsPayoutShowComponent {
  constructor() {
  }
}
