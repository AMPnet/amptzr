import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Observable } from 'rxjs'
import { withStatus, WithStatus } from '../shared/utils/observables'
import {
  Payout,
  PayoutManagerService,
} from '../shared/services/blockchain/payout-manager.service'
import { constants } from 'ethers'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-payouts',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutsComponent {
  payouts$: Observable<WithStatus<Payout[]>>
  bigNumberConstants = constants

  constructor(private payoutManagerService: PayoutManagerService) {
    this.payouts$ = withStatus(
      this.payoutManagerService.payouts$.pipe(
        map((payouts) =>
          payouts
            .slice()
            .sort((a, b) =>
              a.assetSnapshotBlockNumber.lt(b.assetSnapshotBlockNumber) ? 1 : -1
            )
        )
      )
    )
  }
}
