import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {Payout, PayoutService, PayoutStatus} from '../../shared/services/backend/payout.service'
import {map} from 'rxjs/operators'

@Component({
  selector: 'app-payouts-show',
  templateUrl: './payouts-show.component.html',
  styleUrls: ['./payouts-show.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutsShowComponent {
  payouts$: Observable<WithStatus<Payout[]>>

  payoutStatus = PayoutStatus

  constructor(private payoutService: PayoutService) {
    this.payouts$ = withStatus(
      this.payoutService.getPayouts().pipe(
        map(payouts => payouts.sort((a, b) =>
          Number(a.asset_snapshot_block_number) < Number(b.asset_snapshot_block_number) ? 1 : -1),
        ),
      ),
    )
  }
}
