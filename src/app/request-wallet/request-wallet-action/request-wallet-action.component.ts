import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import {
  switchMapTap,
  withStatus,
  WithStatus,
} from '../../shared/utils/observables'
import { constants } from 'ethers'
import {
  RequestBalance,
  RequestBalanceService,
} from '../../request-balance/request-balance.service'
import { SessionQuery } from '../../session/state/session.query'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { SignerService } from '../../shared/services/signer.service'
import { DialogService } from '../../shared/services/dialog.service'
import { IssuerService } from '../../shared/services/blockchain/issuer/issuer.service'
import { ActivatedRoute } from '@angular/router'
import {
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators'
import { getWindow } from '../../shared/utils/browser'

@Component({
  selector: 'app-request-wallet-action',
  templateUrl: './request-wallet-action.component.html',
  styleUrls: ['./request-wallet-action.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestWalletActionComponent {
  refreshRequestBalance = new BehaviorSubject<void>(undefined)

  state$!: Observable<RequestBalance>
  stateWithStatus$!: Observable<WithStatus<RequestBalance>>

  isUserLoggedIn$ = this.sessionQuery.isLoggedIn$
  shouldSign$: Observable<boolean>

  bigNumberConstants = constants
  issuer$ = this.issuerService.issuer$

  address$: Observable<string | undefined> = this.requestBalanceService.getRequest(
    this.route.snapshot.params.id
  ).pipe(switchMap(res => of(res.wallet_address?.toLowerCase())))

  connectedAddress$ = this.preferenceQuery.address$.pipe(
    map(res => res.toLowerCase())
  )

  constructor(
    private requestBalanceService: RequestBalanceService,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private signerService: SignerService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private issuerService: IssuerService
  ) {
    const requestBalanceID = this.route.snapshot.params.id

    this.state$ = this.refreshRequestBalance.asObservable().pipe(
      switchMap(() => requestBalanceService.getRequest(requestBalanceID)),
      distinctUntilChanged((p, c) => JSON.stringify(p) === JSON.stringify(c)),
      shareReplay(1)
    )
    this.stateWithStatus$ = withStatus(this.state$)

    this.shouldSign$ = combineLatest([this.isUserLoggedIn$]).pipe(
      map(([isUserLoggedIn]) => isUserLoggedIn),
      distinctUntilChanged()
    )
  }

  confirmOwnership(state: RequestBalance) {
    return () => {
      return this.signerService.ensureAuth.pipe(
        switchMap(() => this.signerService.signMessage(state.message_to_sign)),
        switchMapTap((signedMessage) =>
          this.requestBalanceService.updateRequest(state.id, {
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

  closeWindow() {
    getWindow()?.close()
  }
}
