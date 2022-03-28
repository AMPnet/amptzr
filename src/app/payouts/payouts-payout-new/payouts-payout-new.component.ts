import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-payouts-payout-new',
  templateUrl: './payouts-payout-new.component.html',
  styleUrls: ['./payouts-payout-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutsPayoutNewComponent {
  constructor() {
  }
}
