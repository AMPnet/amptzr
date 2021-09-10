import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {getWindow} from '../../shared/utils/browser'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {ReturnFrequencies} from 'types/ipfs/campaign'
import {ViewportScroller} from '@angular/common'
import {BigNumber} from 'ethers'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'

@Component({
  selector: 'app-admin-campaign-new',
  templateUrl: './admin-campaign-new.component.html',
  styleUrls: ['./admin-campaign-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignNewComponent {
  @Input() assetData!: {
    asset: AssetWithInfo | FtAssetWithInfo,
    balance: BigNumber,
  }

  creationStep: 1 | 2 = 1
  createForm1: FormGroup
  createForm2: FormGroup

  readonly ReturnFrequencies: ReturnFrequencies = ['monthly', 'quarterly', 'semi-annual', 'annual']
  readonly ReturnFrequencyNames = {
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'semi-annual': 'Semi-annualy',
    'annual': 'Annualy',
  }

  constructor(private viewportScroller: ViewportScroller,
              private preferenceQuery: PreferenceQuery,
              private issuerPathPipe: IssuerPathPipe,
              private stablecoinService: StablecoinService,
              private fb: FormBuilder) {
    this.createForm1 = this.fb.group({
      name: ['', Validators.required],
      ansName: ['', [Validators.required, Validators.pattern('[A-Za-z0-9][A-Za-z0-9_-]*')]],
      hardCap: [0, [Validators.required, Validators.min(1)]],
      softCap: [0, [Validators.required, Validators.min(0)]],
      hardCapTokensPercentage: [0, [Validators.required, Validators.min(0.01),
        this.validHardCapTokensMaxPercentage.bind(this)]],
      hasMinAndMaxInvestment: [false, Validators.required],
      minInvestment: [{value: undefined, disabled: true}, [Validators.required, Validators.min(0.01)]],
      maxInvestment: [{value: undefined, disabled: true}, [Validators.required, Validators.min(0.01)]],
      isReturningProfitsToInvestors: [false, Validators.required],
      returnFrequency: [{value: '', disabled: true}, Validators.required],
      isReturnValueFixed: [false, Validators.required],
      returnFrom: [{value: undefined, disabled: true}, [Validators.required, Validators.min(0.01), Validators.max(1)]],
      returnTo: [{value: undefined, disabled: true}, [Validators.required, Validators.min(0.01), Validators.max(1)]],
      isIdVerificationRequired: [false, Validators.required],
    }, {
      validators: [
        AdminCampaignNewComponent.validSoftCap,
        AdminCampaignNewComponent.validMinMaxInvestments,
        AdminCampaignNewComponent.validReturnFromTo,
      ]
    })

    this.createForm2 = this.fb.group({
      logo: [undefined, Validators.required],
    })
  }

  get campaignUrl() {
    return getWindow().location.origin + this.issuerPathPipe.transform(`/offers/`)
  }

  get maxTokensPercentage() {
    if (!this.assetData) {
      return 0
    }

    const currentSupply = this.stablecoinService.format(this.assetData.balance, 18)
    const initialSupply = this.stablecoinService.format(this.assetData.asset.initialTokenSupply, 18)
    return currentSupply / initialSupply
  }

  get pricePerToken() {
    const totalTokens = this.stablecoinService.format(this.assetData.asset.initialTokenSupply, 18)
    const percentage = this.createForm1.value.hardCapTokensPercentage
    const numOfTokensToSell = (totalTokens * percentage)

    if (numOfTokensToSell === 0) {
      return 0
    }

    return this.createForm1.value.hardCap / numOfTokensToSell
  }

  get softCapTokensPercentage() {
    const pricePerToken = this.pricePerToken

    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = this.createForm1.value.softCap / this.pricePerToken

    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(this.assetData.asset.initialTokenSupply, 18)
    return numOfTokensToSell / totalTokens
  }

  toggleMinAndMaxInvestmentControls(value: boolean) {
    if (value) {
      this.createForm1.controls.minInvestment.enable()
      this.createForm1.controls.maxInvestment.enable()
    } else {
      this.createForm1.controls.minInvestment.disable()
      this.createForm1.controls.maxInvestment.disable()
    }
  }

  toggleReturnFrequency(value: boolean) {
    if (value) {
      this.createForm1.controls.returnFrequency.enable()
      this.createForm1.controls.returnFrom.enable()

      if (!this.createForm1.value.isReturnValueFixed) {
        this.createForm1.controls.returnTo.enable()
      }
    } else {
      this.createForm1.controls.returnFrequency.disable()
      this.createForm1.controls.returnFrom.disable()
      this.createForm1.controls.returnTo.disable()
    }
  }

  toggleReturnTo(value: boolean) {
    if (!value && this.createForm1.value.isReturningProfitsToInvestors) {
      this.createForm1.controls.returnTo.enable()
    } else {
      this.createForm1.controls.returnTo.disable()
    }
  }

  nextCreationStep() {
    this.creationStep = 2
    this.viewportScroller.scrollToPosition([0, 0])
  }

  previousCreationStep() {
    this.creationStep = 1
    this.viewportScroller.scrollToPosition([0, 0])
  }

  private validHardCapTokensMaxPercentage(formControl: FormControl): ValidationErrors | null {
    if (formControl.value > this.maxTokensPercentage) {
      return {invalidHardCapTokensMaxPercentage: true}
    }

    return null
  }

  private static validSoftCap(formGroup: FormGroup): ValidationErrors | null {
    if (formGroup.value.softCap >= 0 && formGroup.value.softCap <= formGroup.value.hardCap) {
      return null
    }

    return {invalidSoftCap: true}
  }

  private static validMinMaxInvestments(formGroup: FormGroup): ValidationErrors | null {
    if (!formGroup.value.hasMinAndMaxInvestment) {
      return null
    }

    if (formGroup.value.minInvestment > formGroup.value.maxInvestment) {
      return {invalidMinMaxInvestments: true}
    }

    if (formGroup.value.maxInvestment > formGroup.value.hardCap) {
      return {invalidMaxInvestment: true}
    }

    return null
  }

  private static validReturnFromTo(formGroup: FormGroup): ValidationErrors | null {
    if (!formGroup.value.isReturningProfitsToInvestors) {
      return null
    }

    if (formGroup.value.isReturnValueFixed) {
      return null
    }

    if (formGroup.value.returnFrom >= formGroup.value.returnTo) {
      return {invalidReturnFromTo: true}
    }

    return null
  }
}
