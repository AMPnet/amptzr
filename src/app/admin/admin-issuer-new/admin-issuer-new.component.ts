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
              private router: RouterService,
              private dialogService: DialogService,
              private userService: UserService,
              private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      logo: [undefined, Validators.required],
    })
  }

  create() {
    return this.issuerService.uploadInfo(
      this.createForm.value.name,
      this.createForm.value.logo?.[0],
      '', '',
    ).pipe(
      switchMap(uploadRes => this.issuerService.create({
        info: uploadRes.path,
        mappedName: this.createForm.value.slug,
      }, IssuerFlavor.BASIC)),
      switchMap(_issuerAddress => this.dialogService.info('Issuer successfully created!', false).pipe(
        switchMap(() => this.router.router.navigate(['/'])),
      )),
    )
  }

  logout() {
    this.userService.logout().subscribe()
  }
}
