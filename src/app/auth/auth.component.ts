import {ChangeDetectionStrategy, Component, Optional} from '@angular/core'
import {defer, Observable, of} from 'rxjs'
import {tap} from 'rxjs/operators'
import {PreferenceQuery} from '../preference/state/preference.query'
import {PreferenceStore} from '../preference/state/preference.store'
import {SignerService} from '../shared/services/signer.service'
import {MetamaskSubsignerService} from '../shared/services/subsigners/metamask-subsigner.service'
import {VenlySubsignerService} from '../shared/services/subsigners/venly-subsigner.service'
import {WalletConnectSubsignerService} from '../shared/services/subsigners/walletconnect-subsigner.service'
import {MatDialogRef} from '@angular/material/dialog'
import {RouterService} from '../shared/services/router.service'
import {IssuerService} from '../shared/services/blockchain/issuer.service'
import {getWindow} from '../shared/utils/browser'

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  issuer$ = this.issuerService.issuerWithStatus$
  injectedWeb3$: Observable<any> = defer(() => of(getWindow()?.ethereum))

  constructor(private signer: SignerService,
              private preferenceStore: PreferenceStore,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private walletConnectSubsignerService: WalletConnectSubsignerService,
              private venlySubsignerService: VenlySubsignerService,
              private preferenceQuery: PreferenceQuery,
              private router: RouterService,
              private issuerService: IssuerService,
              @Optional() private dialogRef: MatDialogRef<AuthComponent>) {
  }

  afterLoginActions() {
    this.dialogRef.close(true)
  }

  connectMetamask(): Observable<unknown> {
    return this.signer.login(this.metamaskSubsignerService).pipe(
      tap(() => this.afterLoginActions()),
    )
  }

  connectVenly(): Observable<unknown> {
    return this.signer.login(this.venlySubsignerService).pipe(
      tap(() => this.afterLoginActions()),
    )
  }
}
