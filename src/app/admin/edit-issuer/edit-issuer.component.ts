import {ChangeDetectionStrategy, Component} from '@angular/core'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {Observable} from 'rxjs'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {switchMap, tap} from 'rxjs/operators'
import {DialogService} from '../../shared/services/dialog.service'
import {RouterService} from '../../shared/services/router.service'
import {fromPromise} from 'rxjs/internal-compatibility'

@Component({
  selector: 'app-edit-issuer',
  templateUrl: './edit-issuer.component.html',
  styleUrls: ['./edit-issuer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditIssuerComponent {
  issuer$: Observable<IssuerWithInfo>
  stableCoinSymbol: string

  updateForm: FormGroup
  updateWalletApproverAddressForm: FormGroup
  updateOwnerAddressForm: FormGroup

  constructor(private routerService: RouterService,
              private issuerService: IssuerService,
              private stableCoinService: StablecoinService,
              private dialogService: DialogService,
              private fb: FormBuilder,) {
    this.stableCoinSymbol = this.stableCoinService.symbol

    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      logo: [undefined],
    })
    this.updateWalletApproverAddressForm = this.fb.group({
      walletApproverAddress: ['', [Validators.required, EditIssuerComponent.validAddress]],
    })
    this.updateOwnerAddressForm = this.fb.group({
      ownerAddress: ['', [Validators.required, EditIssuerComponent.validAddress]],
    })

    this.issuer$ = this.issuerService.issuer$.pipe(
      tap(issuer => {
        this.updateForm.reset()
        this.updateForm.setValue({
          ...this.updateForm.value,
          name: issuer.name || '',
        })

        this.updateWalletApproverAddressForm.reset()
        this.updateWalletApproverAddressForm.setValue({
          walletApproverAddress: issuer.walletApprover || '',
        })

        this.updateOwnerAddressForm.reset()
        this.updateOwnerAddressForm.setValue({
          ownerAddress: issuer.owner || '',
        })
      }),
    )
  }

  updateNameAndLogo(issuer: IssuerWithInfo) {
    return () => {
      if (this.updateForm.value.name !== issuer.name || this.updateForm.value.logo?.[0]) {
        return this.issuerService.uploadInfo(
          this.updateForm.value.name,
          this.updateForm.value.logo?.[0],
          issuer,
        ).pipe(
          switchMap(uploadRes => this.issuerService.updateInfo(issuer.contractAddress, uploadRes.path)),
          tap(() => this.routerService.navigate(['/../admin'])),
          switchMap(() => this.dialogService.info('Issuer successfully updated!', false)),
        )
      }

      return fromPromise(this.routerService.navigate(['/../admin']))
    }
  }

  updateWalletApproverAddress(issuer: IssuerWithInfo) {
    return () => this.issuerService.changeWalletApprover(
      issuer.contractAddress, this.updateWalletApproverAddressForm.value.walletApproverAddress,
    ).pipe(
      tap(() => this.updateWalletApproverAddressForm.markAsPristine()),
      switchMap(() => this.dialogService.info('Wallet approver changed successfully!', false)),
    )
  }

  updateOwnerAddress(issuer: IssuerWithInfo) {
    return () => this.issuerService.changeOwner(
      issuer.contractAddress, this.updateOwnerAddressForm.value.ownerAddress,
    ).pipe(
      tap(() => this.updateOwnerAddressForm.markAsPristine()),
      switchMap(() => this.dialogService.info('Owner changed successfully!', false)),
    )
  }

  private static validAddress(control: AbstractControl): ValidationErrors | null {
    if (/^0x[a-fA-F0-9]{40}$/.test(control.value)) {
      return null
    }

    return {invalidAddress: true}
  }
}
