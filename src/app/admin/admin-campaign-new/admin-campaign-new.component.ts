import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {getWindow} from '../../shared/utils/browser'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {ReturnFrequencies, ReturnFrequency} from 'types/ipfs/campaign'
import {ViewportScroller} from '@angular/common'
import {BigNumber} from 'ethers'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetService, FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {quillMods} from '../../shared/utils/quill'
import {CampaignService} from '../../shared/services/blockchain/campaign.service'
import {switchMap} from 'rxjs/operators'
import {TokenPrice} from '../../shared/utils/token-price'
import {RouterService} from '../../shared/services/router.service'
import {DialogService} from '../../shared/services/dialog.service'

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
  @Input() assetService!: AssetService | FtAssetService

  creationStep: 1 | 2 = 1
  createForm1: FormGroup
  createForm2: FormGroup
  newsUrls: FormArray

  quillMods = quillMods

  readonly ReturnFrequencies: ReturnFrequencies = ['monthly', 'quarterly', 'semi-annual', 'annual']
  readonly ReturnFrequencyNames = {
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'semi-annual': 'Semi-annualy',
    'annual': 'Annualy',
  }

  constructor(private campaignService: CampaignService,
              private viewportScroller: ViewportScroller,
              private preferenceQuery: PreferenceQuery,
              private issuerPathPipe: IssuerPathPipe,
              private stablecoinService: StablecoinService,
              private routerService: RouterService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.createForm1 = this.fb.group({
      name: ['', Validators.required],
      ansName: ['', [Validators.required, Validators.pattern('[A-Za-z0-9][A-Za-z0-9_-]*')]],
      hardCap: [0, Validators.required],
      softCap: [0, Validators.required],
      hardCapTokensPercentage: [0, Validators.required],
      tokenPrice: [0, Validators.required],
      hasMinAndMaxInvestment: [false, Validators.required],
      minInvestment: [{value: undefined, disabled: true}, Validators.required],
      maxInvestment: [{value: undefined, disabled: true}, Validators.required],
      isReturningProfitsToInvestors: [false, Validators.required],
      returnFrequency: [{value: '', disabled: true}, Validators.required],
      isReturnValueFixed: [false, Validators.required],
      returnFrom: [{value: undefined, disabled: true}, [Validators.required, Validators.min(0.01), Validators.max(1)]],
      returnTo: [{value: undefined, disabled: true}, [Validators.required, Validators.min(0.01), Validators.max(1)]],
      isIdVerificationRequired: [false, Validators.required],
    }, {
      validators: [
        this.validMonetaryValues.bind(this),
        AdminCampaignNewComponent.validReturnFromTo,
      ]
    })

    this.createForm2 = this.fb.group({
      logo: [undefined, Validators.required],
      about: ['', Validators.required],
      description: ['', Validators.required],
      startDate: [undefined, Validators.required],
      endDate: [undefined, Validators.required],
      documentUpload: [undefined],
      documents: [[]],
      newsUrls: this.fb.array([]),
    }, {
      validators: [AdminCampaignNewComponent.validDateRange]
    })

    this.newsUrls = this.createForm2.get('newsUrls') as FormArray
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

    const pricePerToken = this.createForm1.value.hardCap / numOfTokensToSell
    return Math.round(pricePerToken * 10_000) / 10_000
  }

  get softCapTokensPercentage() {
    const pricePerToken = this.pricePerToken
    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = this.createForm1.value.softCap / pricePerToken
    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(this.assetData.asset.initialTokenSupply, 18)
    return numOfTokensToSell / totalTokens
  }

  onHardCapBlur() {
    this.createForm1.controls.tokenPrice.setValue(this.pricePerToken)
  }

  onHardCapTokensPercentageBlur() {
    this.createForm1.controls.tokenPrice.setValue(this.pricePerToken)
  }

  onTokenPriceBlur() {
    this.createForm1.controls.hardCapTokensPercentage.setValue(
      this.tokenPercentage(this.createForm1.value.tokenPrice, this.createForm1.value.hardCap)
    )
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

  markDescriptionAsDirty() {
    this.createForm2.get('description')?.markAsDirty()
  }

  onDocumentFilesAdded(newDocuments: File[]) {
    const documents = this.createForm2.value.documents.concat(newDocuments)
    this.createForm2.controls.documents.setValue(documents)
  }

  removeDocumentFile(index: number) {
    this.createForm2.value.documents.splice(index, 1)
    this.createForm2.markAsDirty()
  }

  newsUrlsControls() {
    return this.newsUrls.controls as FormControl[]
  }

  addNewsUrl() {
    this.newsUrls.push(this.fb.control('', [Validators.required, Validators.pattern('[^\\s]*')]))
  }

  removeNewsUrl(index: number) {
    this.newsUrls.removeAt(index)
    this.newsUrls.markAsDirty()
  }

  create() {
    const ansName = this.createForm1.value.ansName
    return this.campaignService.uploadInfo({
      name: this.createForm1.value.name,
      photo: this.createForm2.value.logo?.[0],
      about: this.createForm2.value.about,
      description: this.createForm2.value.description,
      startDate: new Date(this.createForm2.value.startDate).toISOString(),
      endDate: new Date(this.createForm2.value.endDate).toISOString(),
      return: this.createCampaignReturnObject(),
      newDocuments: this.createForm2.value.documents,
      newsURLs: this.newsUrls.value,
    }).pipe(
      switchMap(uploadRes => this.campaignService.create({
        ansName: ansName,
        assetAddress: this.assetData.asset.contractAddress,
        initialPricePerToken: TokenPrice.format(this.createForm1.value.tokenPrice),
        softCap: this.stablecoinService.parse(this.createForm1.value.softCap),
        minInvestment: this.getInvestmentValue(this.createForm1.value.minInvestment),
        maxInvestment: this.getInvestmentValue(this.createForm1.value.maxInvestment),
        whitelistRequired: this.createForm1.value.isIdVerificationRequired,
        info: uploadRes.path,
      })),
      switchMap(campaignAddress =>
        this.dialogService.info(
          'Campaign successfully created! You will be asked to sign a transaction to transfer' +
          ' your ' + this.assetData.asset.symbol + ' tokens to your campaign.',
          false
        ).pipe(
          switchMap(() => this.addTokensToCampaign(campaignAddress!)),
          switchMap(() => this.dialogService.info('Tokens added to campaign.', false)),
          switchMap(() => this.routerService.router.navigate([`../${ansName}`])), // TODO navigate correctly
        )
      ),
    )
  }

  private tokenPercentage(pricePerToken: number, totalValue: number) {
    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = totalValue / pricePerToken
    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(this.assetData.asset.initialTokenSupply, 18)
    return numOfTokensToSell / totalTokens
  }

  private validMonetaryValues(formGroup: FormGroup): ValidationErrors | null {
    const hardCap = formGroup.value.hardCap
    if (hardCap <= 0) {
      return {invalidHardCap: true}
    }

    const softCap = formGroup.value.softCap
    if (softCap <= 0 || softCap > hardCap) {
      return {invalidSoftCap: true}
    }

    const hardCapTokensPercentage = formGroup.value.hardCapTokensPercentage
    if (hardCapTokensPercentage <= 0 || hardCapTokensPercentage > this.maxTokensPercentage) {
      return {invalidHardCapTokensMaxPercentage: true}
    }

    if (formGroup.value.tokenPrice <= 0) {
      return {invalidTokenPrice: true}
    }

    if (formGroup.value.hasMinAndMaxInvestment) {
      const minInvestment = formGroup.value.minInvestment
      const maxInvestment = formGroup.value.maxInvestment
      if (minInvestment <= 0 || minInvestment > maxInvestment) {
        return {invalidMinInvestment: true}
      }

      if (maxInvestment <= 0 || maxInvestment > formGroup.value.hardCap) {
        return {invalidMaxInvestment: true}
      }
    }

    return null
  }

  private static validReturnFromTo(formGroup: FormGroup): ValidationErrors | null {
    if (formGroup.value.isReturningProfitsToInvestors) {
      const returnFrom = formGroup.value.returnFrom
      if (returnFrom <= 0 || returnFrom > 1) {
        return {invalidReturnFrom: true}
      }

      if (!formGroup.value.isReturnValueFixed) {
        const returnTo = formGroup.value.returnTo
        if (returnTo <= 0 || returnTo > 1) {
          return {invalidReturnTo: true}
        }

        if (returnFrom >= returnTo) {
          return {invalidReturnFromToRange: true}
        }
      }
    }

    return null
  }

  private static validDateRange(formGroup: FormGroup): ValidationErrors | null {
    if (formGroup.value.startDate > formGroup.value.endDate) {
      return {invalidDateRange: true}
    }

    return null
  }

  private createCampaignReturnObject(): { frequency?: ReturnFrequency, from?: number, to?: number } {
    if (this.createForm1.value.isReturningProfitsToInvestors) {
      if (this.createForm1.value.isReturnValueFixed) {
        return {
          frequency: this.createForm1.value.returnFrequency,
          from: this.createForm1.value.returnFrom,
        }
      }

      return {
        frequency: this.createForm1.value.returnFrequency,
        from: this.createForm1.value.returnFrom,
        to: this.createForm1.value.returnTo,
      }
    }

    return {}
  }

  private getInvestmentValue(value: number) {
    if (this.createForm1.value.hasMinAndMaxInvestment) {
      return this.stablecoinService.parse(value)
    }

    return BigNumber.from(1)
  }

  private addTokensToCampaign(campaignAddress: string) {
    const tokenBalance = this.stablecoinService.format(this.assetData.balance)
    // Due to possible rounding errors, we use min(specifiedCampaignTokens, assetTokenBalance) to ensure that valid
    // amount is always sent here.
    const tokenAmount = Math.min(this.createForm1.value.hardCap / this.createForm1.value.tokenPrice, tokenBalance)

    return this.assetService.transferTokensToCampaign(
      this.assetData.asset.contractAddress,
      campaignAddress,
      tokenAmount
    )
  }
}
