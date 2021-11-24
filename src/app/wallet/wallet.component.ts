import {ChangeDetectionStrategy, Component} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {finalize, switchMap} from 'rxjs/operators'
import {EMPTY, Observable, of} from 'rxjs'
import {VenlySubsignerService} from '../shared/services/subsigners/venly-subsigner.service'
import {AuthProvider} from '../preference/state/preference.store'
import {withStatus} from '../shared/utils/observables'
import {RouterService} from '../shared/services/router.service'
import {StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {UserService} from '../shared/services/user.service'
import {TransactionType} from '../shared/services/backend/report.service'
import {BackendHttpClient} from '../shared/services/backend/backend-http-client.service'
import {PreferenceQuery} from '../preference/state/preference.query'
import {BackendUser, BackendUserService} from '../shared/services/backend/backend-user.service'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {
  authProviderType = AuthProvider
  transactionType = TransactionType

  authProvider$ = this.sessionQuery.authProvider$

  user$: Observable<Partial<BackendUser>> = this.preferenceQuery.isBackendAuthorized$.pipe(
    switchMap(isAuth => isAuth ? this.backendUserService.getUser() : of({})),
  )

  address$ = this.sessionQuery.address$
  balance$ = withStatus(this.stablecoin.balance$)

  // TODO: base currency balance will probably be used here in the future for gas indicator.
  // nativeTokenBalance$ = combineLatest([this.sessionQuery.provider$, this.sessionQuery.address$]).pipe(
  //   switchMap(([provider, address]) => withStatus(
  //     from(provider.getBalance(address!)).pipe(
  //       map(value => this.stablecoin.format(value)),
  //     ),
  //   )),
  // )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private signerService: SignerService,
              public stablecoin: StablecoinService,
              private userService: UserService,
              private backendUserService: BackendUserService,
              private venly: VenlySubsignerService,
              private http: BackendHttpClient,
              private router: RouterService) {
  }

  logout() {
    this.userService.logout().pipe(
      finalize(() => this.router.navigate(['/'])),
    ).subscribe()
  }

  manageVenlyWallets(): Observable<unknown> {
    return this.venly.manageWallets().pipe(
      switchMap(res => res ? this.signerService.login(this.venly, {force: false}) : EMPTY),
      switchMap(() => this.http.logout()),
    )
  }
}
