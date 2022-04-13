import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, Observable, switchMap, tap} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {Payout, PayoutManagerService} from '../../shared/services/blockchain/payout-manager.service'
import {ActivatedRoute} from '@angular/router'
import {BigNumber} from 'ethers'
import {DialogService} from '../../shared/services/dialog.service'

@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  styleUrls: ['./payout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutComponent {
  payout$: Observable<WithStatus<Payout>>
  refreshPayoutSub = new BehaviorSubject<void>(undefined)

  constructor(private payoutManagerService: PayoutManagerService,
              private dialogService: DialogService,
              private route: ActivatedRoute) {
    const payoutID = this.route.snapshot.params.id

    this.payout$ = withStatus(
      this.refreshPayoutSub.asObservable().pipe(
        switchMap(() => this.payoutManagerService.getPayout(payoutID)),
      ),
    )
  }

  cancelPayout(id: BigNumber) {
    return () => {
      return this.payoutManagerService.cancelPayout(id).pipe(
        switchMap(() => this.dialogService.info({
          title: 'Success',
          message: 'The payout has been canceled.',
          cancelable: false,
        }).pipe(
          tap(() => this.refreshPayoutSub.next()),
        )),
      )
    }
  }
}
