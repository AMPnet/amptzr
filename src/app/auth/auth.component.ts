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
import {getWindow} from '../shared/utils/browser'
import {IssuerService} from '../shared/services/blockchain/issuer/issuer.service'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {MagicSubsignerService} from '../shared/services/subsigners/magic-subsigner.service'

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  emailForm: FormGroup

  issuer$ = this.issuerService.issuerWithStatus$
  injectedWeb3$: Observable<any> = defer(() => of(getWindow()?.ethereum))
  magicLinkAvailable$ = this.magicSubsignerService.isAvailable$
  venlyAvailable$ = this.venlySubsignerService.isAvailable$

  constructor(private signer: SignerService,
              private preferenceStore: PreferenceStore,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private magicSubsignerService: MagicSubsignerService,
              private walletConnectSubsignerService: WalletConnectSubsignerService,
              private venlySubsignerService: VenlySubsignerService,
              private preferenceQuery: PreferenceQuery,
              private router: RouterService,
              private issuerService: IssuerService,
              private fb: FormBuilder,
              @Optional() private dialogRef: MatDialogRef<AuthComponent>) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  afterLoginActions() {
    this.dialogRef.close(true)
  }

  connectMetamask(): Observable<unknown> {
    return this.signer.login(this.metamaskSubsignerService).pipe(
      tap(() => this.afterLoginActions()),
    )
  }

  connectMagic(): Observable<unknown> {
    return this.signer.login(this.magicSubsignerService, {
      email: this.emailForm.value.email, force: true,
    }).pipe(
      tap(() => this.afterLoginActions()),
    )
  }

  connectVenly(): Observable<unknown> {
    return this.signer.login(this.venlySubsignerService).pipe(
      tap(() => this.afterLoginActions()),
    )
  }
}
