import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import {
  switchMapTap,
  withStatus,
  WithStatus,
} from '../../shared/utils/observables'
import { FormBuilder } from '@angular/forms'
import { constants } from 'ethers'
import {
  RequestBalance,
  RequestBalanceService,
} from '../request-balance.service'
import { SessionQuery } from '../../session/state/session.query'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { SignerService } from '../../shared/services/signer.service'
import {
  Erc20Service,
  ERC20TokenData,
} from '../../shared/services/blockchain/erc20.service'
import { DialogService } from '../../shared/services/dialog.service'
import { ActivatedRoute } from '@angular/router'
import {
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators'

@Component({
  selector: 'app-request-balance-action',
  templateUrl: './request-balance-action.component.html',
  styleUrls: ['./request-balance-action.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestBalanceActionComponent {
  refreshRequestBalance = new BehaviorSubject<void>(undefined)

  state$!: Observable<RequestBalanceState>
  stateWithStatus$!: Observable<WithStatus<RequestBalanceState>>

  isUserLoggedIn$ = this.sessionQuery.isLoggedIn$
  shouldSign$: Observable<boolean>

  bigNumberConstants = constants

  constructor(
    private fb: FormBuilder,
    private requestBalanceService: RequestBalanceService,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private signerService: SignerService,
    private erc20Service: Erc20Service,
    private dialogService: DialogService,
    private route: ActivatedRoute
  ) {
    const requestBalanceID = this.route.snapshot.params.id

    this.state$ = this.refreshRequestBalance.asObservable().pipe(
      switchMap(() => requestBalanceService.getRequest(requestBalanceID)),
      switchMap((requestBalance) =>
        combineLatest([
          of(requestBalance),
          this.erc20Service.getData(requestBalance.token_address),
        ])
      ),
      map(([requestBalance, tokenData]) => ({
        requestBalance,
        tokenData,
      })),
      distinctUntilChanged((p, c) => JSON.stringify(p) === JSON.stringify(c)),
      shareReplay(1)
    )
    this.stateWithStatus$ = withStatus(this.state$)

    this.shouldSign$ = combineLatest([this.isUserLoggedIn$]).pipe(
      map(([isUserLoggedIn]) => isUserLoggedIn),
      distinctUntilChanged()
    )
  }

  confirmOwnership(state: RequestBalanceState) {
    return () => {
      return this.signerService.ensureAuth.pipe(
        switchMap(() =>
          this.signerService.signMessage(state.requestBalance.message_to_sign)
        ),
        switchMapTap((signedMessage) =>
          this.requestBalanceService.updateRequest(state.requestBalance.id, {
            wallet_address: this.preferenceQuery.getValue().address,
            signed_message: signedMessage,
          })
        ),
        tap(() => this.refreshRequestBalance.next()),
        switchMap(() =>
          this.dialogService.success({
            message: 'Confirmation complete.',
          })
        )
      )
    }
  }

  login(): Observable<unknown> {
    return this.signerService.ensureAuth
  }
}

interface RequestBalanceState {
  requestBalance: RequestBalance
  tokenData: ERC20TokenData
}
