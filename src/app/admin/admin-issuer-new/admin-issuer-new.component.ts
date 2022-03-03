import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {catchError, distinctUntilChanged, shareReplay, startWith, switchMap} from 'rxjs/operators'
import {SignerService} from '../../shared/services/signer.service'
import {DialogService} from '../../shared/services/dialog.service'
import {RouterService} from '../../shared/services/router.service'
import {SessionQuery} from '../../session/state/session.query'
import {UserService} from '../../shared/services/user.service'
import {IssuerService} from '../../shared/services/blockchain/issuer/issuer.service'
import {IssuerFlavor} from '../../shared/services/blockchain/flavors'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {getWindow} from '../../shared/utils/browser'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {Observable, of} from 'rxjs'
import {Erc20Service, ERC20TokenData} from '../../shared/services/blockchain/erc20.service'
import {PhysicalInputService} from '../../shared/services/physical-input.service'

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

  constructor(private issuerService: IssuerService,
              private signerService: SignerService,
              private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private router: RouterService,
              private dialogService: DialogService,
              private userService: UserService,
              private erc20Service: Erc20Service,
              private issuerPathPipe: IssuerPathPipe,
              private physicalInputService: PhysicalInputService,
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

    const stablecoinAddressChanged$ = this.createForm.get('stablecoinAddress')!.valueChanges.pipe(
      startWith(this.createForm.value.stablecoinAddress),
      distinctUntilChanged(),
      shareReplay(1),
    )

    this.stablecoin$ = stablecoinAddressChanged$.pipe(
      switchMap(address => /^0x[a-fA-F0-9]{40}$/.test(address) ?
        this.erc20Service.getData(address).pipe(
          catchError(() => of(undefined)),
        ) : of(undefined),
      ),
    )
  }

  create() {
    return this.issuerService.uploadInfo({
      name: this.createForm.value.name,
      logo: this.createForm.value.logo?.[0],
      magicLinkApiKey: '',
      rampApiKey: '',
      crispWebsiteId: '',
    }).pipe(
      switchMap(uploadRes => this.issuerService.create({
        mappedName: this.createForm.value.slug,
        stablecoinAddress: this.createForm.value.stablecoinAddress,
        info: uploadRes.path,
      }, IssuerFlavor.BASIC)),
      switchMap(() => this.dialogService.info({
        title: 'Success',
        message: 'Issuer has been created.',
        cancelable: false,
      }).pipe(
        switchMap(() => this.router.router.navigate(['/'])),
      )),
    )
  }

  get issuerUrlPrefix() {
    return getWindow().location.origin + this.issuerPathPipe.transform('/', {ignoreIssuer: true})
  }
}
