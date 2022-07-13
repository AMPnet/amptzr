import { ChangeDetectionStrategy, Component } from '@angular/core'
import { StablecoinService } from '../../shared/services/blockchain/stablecoin.service'
import { Observable } from 'rxjs'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { map, switchMap, tap } from 'rxjs/operators'
import { DialogService } from '../../shared/services/dialog.service'
import { RouterService } from '../../shared/services/router.service'
import { PreferenceStore } from '../../preference/state/preference.store'
import {
  IssuerService,
  IssuerWithInfo,
} from '../../shared/services/blockchain/issuer/issuer.service'
import {
  IssuerBasicService,
  IssuerBasicState,
} from '../../shared/services/blockchain/issuer/issuer-basic.service'
import { WithStatus, withStatus } from '../../shared/utils/observables'
import { PhysicalInputService } from '../../shared/services/physical-input.service'
import { Location } from '@angular/common'

@Component({
  selector: 'app-admin-issuer-edit',
  templateUrl: './admin-issuer-edit.component.html',
  styleUrls: ['./admin-issuer-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIssuerEditComponent {
  issuer$: Observable<WithStatus<IssuerView>>
  stableCoinSymbol = this.stablecoin.config.symbol
  isAdvancedMode$ = this.physicalInputService.altKeyActive$

  updateForm: FormGroup
  updateWalletApproverAddressForm: FormGroup
  updateOwnerAddressForm: FormGroup

  constructor(
    private routerService: RouterService,
    private issuerService: IssuerService,
    private issuerBasicService: IssuerBasicService,
    private stablecoin: StablecoinService,
    private preferenceStore: PreferenceStore,
    private dialogService: DialogService,
    private location: Location,
    private physicalInputService: PhysicalInputService,
    private fb: FormBuilder
  ) {
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      logo: [undefined],
      rampApiKey: [''],
      magicLinkApiKey: [''],
      crispWebsiteId: [''],
    })
    this.updateWalletApproverAddressForm = this.fb.group({
      walletApproverAddress: [
        '',
        [Validators.required, AdminIssuerEditComponent.validAddress],
      ],
    })
    this.updateOwnerAddressForm = this.fb.group({
      ownerAddress: [
        '',
        [Validators.required, AdminIssuerEditComponent.validAddress],
      ],
    })

    this.issuer$ = withStatus(
      this.issuerService.issuer$.pipe(
        switchMap((issuer) =>
          this.issuerBasicService
            .getStateFromCommon(issuer)
            .pipe(map((issuerBasic) => ({ ...issuer, issuerBasic })))
        ),
        tap((issuer) => {
          this.updateForm.reset()
          this.updateForm.setValue({
            ...this.updateForm.value,
            name: issuer.infoData.name || '',
            rampApiKey: issuer.infoData.rampApiKey || '',
            magicLinkApiKey: issuer.infoData.magicLinkApiKey || '',
            crispWebsiteId: issuer.infoData.crispWebsiteId || '',
          })

          this.updateWalletApproverAddressForm.reset()
          this.updateWalletApproverAddressForm.setValue({
            walletApproverAddress: issuer.issuerBasic?.walletApprover || '',
          })

          this.updateOwnerAddressForm.reset()
          this.updateOwnerAddressForm.setValue({
            ownerAddress: issuer.owner || '',
          })
        })
      )
    )
  }

  updateNameAndLogo(issuer: IssuerWithInfo) {
    return () => {
      return this.issuerService
        .uploadInfo({
          name: this.updateForm.value.name,
          logo: this.updateForm.value.logo?.[0],
          rampApiKey: this.updateForm.value.rampApiKey,
          magicLinkApiKey: this.updateForm.value.magicLinkApiKey,
          crispWebsiteId: this.updateForm.value.crispWebsiteId,
          issuer: issuer.infoData,
        })
        .pipe(
          switchMap((uploadRes) =>
            this.issuerService.updateInfo(
              issuer.contractAddress,
              uploadRes.path
            )
          ),
          switchMap(() =>
            this.dialogService.success({
              message: 'Issuer has been updated.',
            })
          ),
          tap(() => this.refreshIssuer()),
          tap(() => this.routerService.navigate(['/admin']))
        )
    }
  }

  updateWalletApproverAddress(issuer: IssuerWithInfo) {
    return () => {
      return this.issuerService
        .changeWalletApprover(
          issuer.contractAddress,
          this.updateWalletApproverAddressForm.value.walletApproverAddress
        )
        .pipe(
          tap(() => this.updateWalletApproverAddressForm.markAsPristine()),
          switchMap(() =>
            this.dialogService.success({
              message: 'Wallet approver has been changed.',
            })
          )
        )
    }
  }

  updateOwnerAddress(issuer: IssuerWithInfo) {
    return () => {
      return this.issuerService
        .changeOwner(
          issuer.contractAddress,
          this.updateOwnerAddressForm.value.ownerAddress
        )
        .pipe(
          switchMap(() =>
            this.dialogService.success({
              message: 'The owner has been changed.',
            })
          ),
          tap(() => this.refreshIssuer()),
          tap(() => this.routerService.navigate(['/']))
        )
    }
  }

  private refreshIssuer() {
    this.preferenceStore.update({
      issuer: {
        ...this.preferenceStore.getValue().issuer,
      },
    })
  }

  goBack() {
    this.location.back()
  }

  static validAddress(control: AbstractControl): ValidationErrors | null {
    if (/^0x[a-fA-F0-9]{40}$/.test(control.value)) {
      return null
    }

    return { invalidAddress: true }
  }
}

type IssuerView = IssuerWithInfo & { issuerBasic: IssuerBasicState | undefined }
