import {ChangeDetectionStrategy, Component} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {finalize, switchMap} from 'rxjs/operators'
import {BehaviorSubject, EMPTY, Observable} from 'rxjs'
import {VenlySubsignerService} from '../shared/services/subsigners/venly-subsigner.service'
import {AuthProvider} from '../preference/state/preference.store'
import {withStatus} from '../shared/utils/observables'
import {RouterService} from '../shared/services/router.service'
import {StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {UserService} from '../shared/services/user.service'
import {TransactionType} from '../shared/services/backend/report.service'
import {BackendHttpClient} from '../shared/services/backend/backend-http-client.service'

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

  userIdentitySub = new BehaviorSubject<string>('John Smith')
  userIdentity$ = this.userIdentitySub.asObservable()

  address$ = this.sessionQuery.address$
  balance$ = withStatus(this.stablecoinService.balance$)

  // TODO: base currency balance will probably be used here in the future for gas indicator.
  // nativeTokenBalance$ = combineLatest([this.sessionQuery.provider$, this.sessionQuery.address$]).pipe(
  //   switchMap(([provider, address]) => withStatus(
  //     from(provider.getBalance(address!)).pipe(
  //       map(value => utils.formatEther(value)),
  //     ),
  //   )),
  // )

  constructor(private sessionQuery: SessionQuery,
              private signerService: SignerService,
              private stablecoinService: StablecoinService,
              private userService: UserService,
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
