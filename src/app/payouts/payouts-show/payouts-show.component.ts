import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {withInterval, withStatus, WithStatus} from '../../shared/utils/observables'
import {Payout, PayoutService} from '../../shared/services/backend/payout.service'

@Component({
  selector: 'app-payouts-show',
  templateUrl: './payouts-show.component.html',
  styleUrls: ['./payouts-show.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutsShowComponent {
  payouts$: Observable<WithStatus<Payout[]>>

  constructor(private payoutService: PayoutService) {
    this.payouts$ = withInterval(
      withStatus(
        this.payoutService.getPayouts(),
      ), 10_000)
  }
}
