import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, Observable, switchMap, tap} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {ClaimablePayout, PayoutService} from '../../shared/services/backend/payout.service'
import {PayoutManagerService} from '../../shared/services/blockchain/payout-manager.service'
import {DialogService} from '../../shared/services/dialog.service'

@Component({
  selector: 'app-claims',
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimsComponent {
  claimablePayouts$: Observable<WithStatus<ClaimablePayout[]>>
  refreshClaimablePayoutsSub = new BehaviorSubject<void>(undefined)

  constructor(private payoutService: PayoutService,
              private payoutManagerService: PayoutManagerService,
              private dialogService: DialogService) {
    this.claimablePayouts$ = withStatus(
      this.refreshClaimablePayoutsSub.asObservable().pipe(
        switchMap(() => this.payoutService.getClaimablePayouts()),
      ),
    )
  }

  claim(claimablePayout: ClaimablePayout) {
    return () => {
      return this.payoutManagerService.claimPayout({
        payoutId: claimablePayout.payout.payoutId,
        wallet: claimablePayout.investor,
        balance: claimablePayout.balance,
        proof: claimablePayout.proof,
      }).pipe(
        switchMap(() => this.dialogService.success({
          message: 'Payout claimed.',
        })),
        tap(() => this.refreshClaimablePayoutsSub.next()),
      )
    }
  }
}
