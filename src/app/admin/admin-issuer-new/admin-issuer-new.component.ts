import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import {
  catchError,
  distinctUntilChanged,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators'
import { SignerService } from '../../shared/services/signer.service'
import { DialogService } from '../../shared/services/dialog.service'
import { RouterService } from '../../shared/services/router.service'
import { SessionQuery } from '../../session/state/session.query'
import { UserService } from '../../shared/services/user.service'
import { IssuerService } from '../../shared/services/blockchain/issuer/issuer.service'
import { IssuerFlavor } from '../../shared/services/blockchain/flavors'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { getWindow } from '../../shared/utils/browser'
import { IssuerPathPipe } from '../../shared/pipes/issuer-path.pipe'
import { Observable, of } from 'rxjs'
import {
  Erc20Service,
  ERC20TokenData,
} from '../../shared/services/blockchain/erc20.service'
import { PhysicalInputService } from '../../shared/services/physical-input.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'

@Component({
  selector: 'app-admin-issuer-new',
  templateUrl: './admin-issuer-new.component.html',
  styleUrls: ['./admin-issuer-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIssuerNewComponent {
  createForm: FormGroup

  stablecoin$: Observable<ERC20TokenData | undefined>
  altKeyActive$ = this.physicalInputService.altKeyActive$
  updateSlugFromName$: Observable<unknown>

  balance$ = this.userService.nativeTokenBalance$
  address$ = this.preferenceQuery.address$
  network$ = this.preferenceQuery.network$

  constructor(
    private issuerService: IssuerService,
    private signerService: SignerService,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private router: RouterService,
    private dialogService: DialogService,
    private userService: UserService,
    private erc20Service: Erc20Service,
    private projectService: ProjectService,
    private issuerPathPipe: IssuerPathPipe,
    private physicalInputService: PhysicalInputService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9\-_]+$/)]],
      logo: [undefined, Validators.required],
      stablecoinAddress: [
        this.preferenceQuery.network.tokenizerConfig.defaultStableCoin,
        [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)],
      ],
    })

    const stablecoinAddressChanged$ = this.createForm
      .get('stablecoinAddress')!
      .valueChanges.pipe(
        startWith(this.createForm.value.stablecoinAddress),
        distinctUntilChanged(),
        shareReplay(1)
      )

    this.stablecoin$ = stablecoinAddressChanged$.pipe(
      switchMap((address) =>
        /^0x[a-fA-F0-9]{40}$/.test(address)
          ? this.erc20Service
              .getData(address)
              .pipe(catchError(() => of(undefined)))
          : of(undefined)
      )
    )

    const nameChanged$: Observable<string> = this.createForm
      .get('name')!
      .valueChanges.pipe(
        startWith(this.createForm.value.name),
        distinctUntilChanged(),
        shareReplay(1)
      )

    this.updateSlugFromName$ = nameChanged$.pipe(
      tap((name) =>
        this.createForm
          .get('slug')
          ?.setValue(name.toLowerCase().replaceAll(' ', '-'))
      )
    )
  }

  create() {
    return this.issuerService
      .uploadInfo({
        name: this.createForm.value.name,
        logo: this.createForm.value.logo?.[0],
        magicLinkApiKey: '',
        rampApiKey: '',
        crispWebsiteId: '',
      })
      .pipe(
        switchMap((uploadRes) =>
          this.issuerService.create(
            {
              mappedName: this.createForm.value.slug,
              stablecoinAddress: this.createForm.value.stablecoinAddress,
              info: uploadRes.path,
            },
            IssuerFlavor.BASIC
          )
        ),
        switchMap((issuerAddress) =>
          this.projectService.createNewProject(issuerAddress ?? '', 
            `${this.issuerUrlPrefix}${this.createForm.controls.slug.value}`)
        ),
        switchMap(() =>
          this.dialogService
            .info({
              title: 'Success',
              message: `Your Dev3 project has been created! Enter the project dashboard to start using the application.`,
              cancelable: false,
            })
            .pipe(switchMap(() => this.router.router.navigate(['/'])))
        )
      )
  }

  get issuerUrlPrefix() {
    return (
      getWindow().location.origin +
      this.issuerPathPipe.transform('/', { ignoreIssuer: true })
    )
  }
}
