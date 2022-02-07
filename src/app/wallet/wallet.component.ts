import {ChangeDetectionStrategy, Component} from '@angular/core'
import {SignerService} from '../shared/services/signer.service'
import {finalize, switchMap} from 'rxjs/operators'
import {Observable, of} from 'rxjs'
import {AuthProvider} from '../preference/state/preference.store'
import {withStatus} from '../shared/utils/observables'
import {RouterService} from '../shared/services/router.service'
import {StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {UserService} from '../shared/services/user.service'
import {TransactionType} from '../shared/services/backend/report.service'
import {BackendHttpClient} from '../shared/services/backend/backend-http-client.service'
import {PreferenceQuery} from '../preference/state/preference.query'
import {BackendUser, BackendUserService} from '../shared/services/backend/backend-user.service'
import {MagicSubsignerService} from '../shared/services/subsigners/magic-subsigner.service'
import {TransferService} from '../transfer/transfer.service'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {
  authProviderType = AuthProvider
  transactionType = TransactionType

  authProvider$ = this.preferenceQuery.authProvider$

  user$: Observable<Partial<BackendUser>> = this.preferenceQuery.isBackendAuthorized$.pipe(
    switchMap(isAuth => isAuth ? this.backendUserService.getUser() : of({})),
  )

  address$ = this.preferenceQuery.address$
  balance$ = withStatus(this.stablecoin.balance$)

  constructor(private preferenceQuery: PreferenceQuery,
              private signerService: SignerService,
              public stablecoin: StablecoinService,
              public transferService: TransferService,
              private userService: UserService,
              private backendUserService: BackendUserService,
              private magicSubsignerService: MagicSubsignerService,
              private http: BackendHttpClient,
              private router: RouterService) {
  }

  logout() {
    this.userService.logout().pipe(
      finalize(() => this.router.navigate(['/'])),
    ).subscribe()
  }

  manageMagicWallet(): Observable<unknown> {
    return this.magicSubsignerService.showSettings()
  }
}
