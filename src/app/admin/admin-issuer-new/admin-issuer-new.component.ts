import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {switchMap} from 'rxjs/operators'
import {SignerService} from '../../shared/services/signer.service'
import {DialogService} from '../../shared/services/dialog.service'
import {RouterService} from '../../shared/services/router.service'
import {SessionQuery} from '../../session/state/session.query'
import {UserService} from '../../shared/services/user.service'
import {IssuerService} from '../../shared/services/blockchain/issuer/issuer.service'
import {IssuerFlavor} from '../../shared/services/blockchain/flavors'
import {PreferenceQuery} from '../../preference/state/preference.query'

@Component({
  selector: 'app-admin-issuer-new',
  templateUrl: './admin-issuer-new.component.html',
  styleUrls: ['./admin-issuer-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIssuerNewComponent {
  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  createForm: FormGroup

  constructor(private issuerService: IssuerService,
              private signerService: SignerService,
              private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private router: RouterService,
              private dialogService: DialogService,
              private userService: UserService,
              private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      logo: [undefined, Validators.required],
      stablecoinAddress: [
        this.preferenceQuery.network.tokenizerConfig.defaultStableCoin,
        Validators.required,
      ],
    })
  }

  create() {
    return this.issuerService.uploadInfo({
      name: this.createForm.value.name,
      logo: this.createForm.value.logo?.[0],
      magicLinkApiKey: '',
      rampApiKey: '',
    }).pipe(
      switchMap(uploadRes => this.issuerService.create({
        mappedName: this.createForm.value.slug,
        stablecoinAddress: this.createForm.value.stablecoinAddress,
        info: uploadRes.path,
      }, IssuerFlavor.BASIC)),
      switchMap(() => this.dialogService.info({
        title: 'Issuer has been created',
        cancelable: false,
      }).pipe(
        switchMap(() => this.router.router.navigate(['/'])),
      )),
    )
  }

  logout() {
    this.userService.logout().subscribe()
  }
}
