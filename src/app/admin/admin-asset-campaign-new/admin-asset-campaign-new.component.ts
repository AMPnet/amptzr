import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {getWindow} from '../../shared/utils/browser'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {ReturnFrequencies, ReturnFrequency} from 'types/ipfs/campaign'
import {DatePipe, PercentPipe, ViewportScroller} from '@angular/common'
import {BigNumber} from 'ethers'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {quillMods} from '../../shared/utils/quill'
import {map, switchMap} from 'rxjs/operators'
import {TokenPrice} from '../../shared/utils/token-price'
import {RouterService} from '../../shared/services/router.service'
import {DialogService} from '../../shared/services/dialog.service'
import {ActivatedRoute} from '@angular/router'
import {BehaviorSubject, combineLatest, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {AssetService, CommonAssetWithInfo} from '../../shared/services/blockchain/asset/asset.service'
import {
  CampaignService,
  CampaignUploadInfoData,
  CreateCampaignData,
} from '../../shared/services/blockchain/campaign/campaign.service'
import {NameService} from '../../shared/services/blockchain/name.service'
import {CampaignFlavor} from '../../shared/services/blockchain/flavors'
import {dateToIsoString} from '../../shared/utils/date'

@Component({
  selector: 'app-admin-asset-campaign-new',
  templateUrl: './admin-asset-campaign-new.component.html',
  styleUrls: ['./admin-asset-campaign-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetCampaignNewComponent {
  assetData$: Observable<WithStatus<AssetData>>
  resolvedAssetData?: AssetData

  setResolvedAssetData(assetData?: AssetData) {
    this.resolvedAssetData = assetData
    return this.resolvedAssetData
  }

  campaignFlavor = CampaignFlavor
  campaignFactory = this.preferenceQuery.network.tokenizerConfig.cfManagerFactory

  stepType = Step
  step$ = new BehaviorSubject<Step>(Step.CREATION_FIRST)

  createForm1: FormGroup
  createForm2: FormGroup
  newsUrls: FormArray
  preview!: CampaignPreview

  quillMods = quillMods

  readonly ReturnFrequencies: ReturnFrequencies = ['monthly', 'quarterly', 'semi-annual', 'annual']
  readonly ReturnFrequencyNames = {
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'semi-annual': 'Semi-annually',
    'annual': 'Annually',
  }

  constructor(private campaignService: CampaignService,
              private nameService: NameService,
              private viewportScroller: ViewportScroller,
              private preferenceQuery: PreferenceQuery,
              private issuerPathPipe: IssuerPathPipe,
              private datePipe: DatePipe,
              private percentPipe: PercentPipe,
              private stablecoinService: StablecoinService,
              private route: ActivatedRoute,
              private assetService: AssetService,
              private routerService: RouterService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    const assetId = this.route.snapshot.params.id
    const asset$ = this.nameService.getAsset(assetId).pipe(
      switchMap(asset => this.assetService.getAssetWithInfo(asset.asset.contractAddress, true)),
    )
    const tokenBalance$ = asset$.pipe(
      switchMap(asset => this.assetService.balance(asset.contractAddress)),
    )

    this.assetData$ = withStatus(
      combineLatest([
        asset$,
        tokenBalance$,
      ]).pipe(
        map(([asset, balance]) => ({asset, balance})),
      ),
    )

    this.createForm1 = this.fb.group({
      name: ['', Validators.required],
      slug: ['', [Validators.required, Validators.pattern('[A-Za-z0-9][A-Za-z0-9_-]*')]],
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
      flavor: [CampaignFlavor.BASIC, Validators.required],
    }, {
      validators: [
        this.validMonetaryValues.bind(this),
        AdminAssetCampaignNewComponent.validReturnFromTo,
      ],
    })

    this.createForm2 = this.fb.group({
      logo: [undefined, Validators.required],
      about: ['', Validators.required],
      description: ['', Validators.required],
      startDate: [undefined],
      endDate: [undefined],
      documentUpload: [undefined],
      documents: [[]],
      newsUrls: this.fb.array([]),
    }, {
      validators: [AdminAssetCampaignNewComponent.validDateRange],
    })

    this.newsUrls = this.createForm2.get('newsUrls') as FormArray
  }

  get campaignUrl() {
    return getWindow().location.origin + this.issuerPathPipe.transform(`/offers/`)
  }

  maxTokensPercentage(data?: AssetData) {
    if (!data) {
      return 0
    }

    const currentSupply = this.stablecoinService.format(data.balance, 18)
    const initialSupply = this.stablecoinService.format(data.asset.totalSupply, 18)
    return currentSupply / initialSupply
  }

  pricePerToken(data: AssetData) {
    const totalTokens = this.stablecoinService.format(data.asset.totalSupply, 18)
    const percentage = this.createForm1.value.hardCapTokensPercentage
    const numOfTokensToSell = (totalTokens * percentage)

    if (numOfTokensToSell === 0) {
      return 0
    }

    const pricePerToken = this.createForm1.value.hardCap / numOfTokensToSell
    return Math.floor(pricePerToken * 10_000) / 10_000
  }

  softCapTokensPercentage(data: AssetData) {
    const pricePerToken = this.pricePerToken(data)
    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = this.createForm1.value.softCap / pricePerToken
    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(data.asset.totalSupply, 18)
    return numOfTokensToSell / totalTokens
  }

  onHardCapBlur(data: AssetData) {
    this.createForm1.controls.tokenPrice.setValue(this.pricePerToken(data))
  }

  onHardCapTokensPercentageBlur(data: AssetData) {
    this.createForm1.controls.tokenPrice.setValue(this.pricePerToken(data))
  }

  onTokenPriceBlur(data: AssetData) {
    const tokenPercentage = this.tokenPercentage(
      this.createForm1.value.tokenPrice, this.createForm1.value.hardCap, data,
    )
    const maxTokensPercentage = this.maxTokensPercentage(data)

    if (tokenPercentage < maxTokensPercentage) {
      this.createForm1.controls.hardCapTokensPercentage.setValue(
        this.tokenPercentage(this.createForm1.value.tokenPrice, this.createForm1.value.hardCap, data),
      )
    } else {
      this.createForm1.controls.hardCapTokensPercentage.setValue(maxTokensPercentage)
      this.createForm1.controls.hardCap.setValue(
        this.stablecoinService.format(data.balance, 18) * this.createForm1.value.tokenPrice,
      )
    }
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

  toggleReturnFrequencyControls(value: boolean) {
    if (value) {
      this.createForm1.controls.isReturnValueFixed.enable()
      this.createForm1.controls.returnFrequency.enable()
      this.createForm1.controls.returnFrom.enable()

      if (!this.createForm1.value.isReturnValueFixed) {
        this.createForm1.controls.returnTo.enable()
      }
    } else {
      this.createForm1.controls.isReturnValueFixed.disable()
      this.createForm1.controls.returnFrequency.disable()
      this.createForm1.controls.returnFrom.disable()
      this.createForm1.controls.returnTo.disable()
    }
  }

  toggleReturnToControls(value: boolean) {
    if (!value && this.createForm1.value.isReturningProfitsToInvestors) {
      this.createForm1.controls.returnTo.enable()
    } else {
      this.createForm1.controls.returnTo.disable()
    }
  }

  firstCreationStep() {
    this.step$.next(Step.CREATION_FIRST)
    this.viewportScroller.scrollToPosition([0, 0])
  }

  secondCreationStep() {
    this.step$.next(Step.CREATION_SECOND)
    this.viewportScroller.scrollToPosition([0, 0])
  }

  previewCampaignStep(data: AssetData) {
    this.preparePreviewData(data)
    this.step$.next(Step.PREVIEW)
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

  create(data: AssetData) {
    return () => {
      return this.campaignService.uploadInfo(this.preview.info).pipe(
        switchMap(uploadRes => this.campaignService.create({
          ...this.preview.data,
          info: uploadRes.path,
        }, this.preview.flavor)),
        switchMap(campaignAddress =>
          this.dialogService.info(
            'Campaign successfully created! You will be asked to sign a transaction to transfer' +
            ' your ' + data.asset.symbol + ' tokens to your campaign.',
            false,
          ).pipe(
            switchMap(() => this.addTokensToCampaign(campaignAddress!, data)),
            switchMap(() => this.dialogService.info('Tokens added to campaign.', false)),
            switchMap(() => this.routerService.navigate([`/admin/campaigns/${campaignAddress}`])),
          ),
        ),
      )
    }
  }

  previewDateRange() {
    if (!!this.preview.info.startDate && !!this.preview.info.endDate) {
      return `${this.formatDate(this.preview.info.startDate)} - ${this.formatDate(this.preview.info.endDate)}`
    }

    if (!!this.preview.info.startDate) {
      return `From ${this.formatDate(this.preview.info.startDate)}`
    }

    if (!!this.preview.info.endDate) {
      return `Until ${this.formatDate(this.preview.info.endDate)}`
    }

    return 'Not specified'
  }

  previewHasMinInvestment() {
    return this.preview.data.minInvestment > BigNumber.from(1)
  }

  previewHasMaxInvestment(assetData: AssetData) {
    const maxInvestment = this.stablecoinService.format(this.preview.data.maxInvestment)
    const maxValue = this.stablecoinService.format(assetData.asset.totalSupply, 18) * this.preview.tokenPrice

    return Number(maxInvestment.toFixed(2)) < Number(maxValue.toFixed(2))
  }

  previewReturn() {
    if (this.preview.info.return.frequency) {
      const frequency = this.ReturnFrequencyNames[this.preview.info.return.frequency]
      const from = this.percentPipe.transform(this.preview.info.return.from)

      if (this.preview.info.return.to) {
        const to = this.percentPipe.transform(this.preview.info.return.to)
        return `${frequency} from ${from} to ${to}`
      }

      return `${frequency} at ${from}`
    }

    return 'No'
  }

  private tokenPercentage(pricePerToken: number, totalValue: number, data: AssetData) {
    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = totalValue / pricePerToken
    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(data.asset.totalSupply, 18)
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
    if (hardCapTokensPercentage <= 0 || hardCapTokensPercentage > this.maxTokensPercentage(this.resolvedAssetData)) {
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
    const startDate = formGroup.value.startDate
    const endDate = formGroup.value.endDate
    if (!!startDate && !!endDate && startDate > endDate) {
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

  private getMinInvestmentValue(hasMinAndMaxInvestment: boolean) {
    if (hasMinAndMaxInvestment) {
      return this.stablecoinService.parse(this.createForm1.value.minInvestment)
    }

    return BigNumber.from(1)
  }

  private getMaxInvestmentValue(hasMinAndMaxInvestment: boolean, data: AssetData) {
    if (hasMinAndMaxInvestment) {
      return this.stablecoinService.parse(this.createForm1.value.maxInvestment)
    }

    return this.stablecoinService.parse(
      this.stablecoinService.format(data.asset.totalSupply, 18) * this.createForm1.value.tokenPrice,
    )
  }

  private addTokensToCampaign(campaignAddress: string, data: AssetData) {
    return this.assetService.transferTokensToCampaign(
      data.asset.contractAddress,
      campaignAddress,
      this.preview.hardCap,
      this.preview.tokenPrice,
    )
  }

  private formatDate(value?: string): string | null {
    return this.datePipe.transform(value, 'mediumDate')
  }

  private preparePreviewData(data: AssetData) {
    const hasMinAndMaxInvestment = this.createForm1.value.hasMinAndMaxInvestment
    const tokenBalance = this.stablecoinService.format(data.balance)
    const tokenPrice = this.createForm1.value.tokenPrice
    // Due to possible rounding errors, we use min(specifiedCampaignTokens, assetTokenBalance) to ensure that valid
    // amount is always sent here.
    const hardCapTokens = Math.min(this.createForm1.value.hardCap / tokenPrice, tokenBalance)
    const softCapTokens = Math.min(this.createForm1.value.softCap / tokenPrice, tokenBalance)
    this.preview = {
      info: {
        name: this.createForm1.value.name,
        photo: this.createForm2.value.logo?.[0],
        about: this.createForm2.value.about,
        description: this.createForm2.value.description,
        startDate: dateToIsoString(this.createForm2.value.startDate) || '',
        endDate: dateToIsoString(this.createForm2.value.endDate) || '',
        return: this.createCampaignReturnObject(),
        newDocuments: this.createForm2.value.documents,
        newsURLs: this.newsUrls.value,
      },
      data: {
        slug: this.createForm1.value.slug,
        assetAddress: data.asset.contractAddress,
        initialPricePerToken: TokenPrice.format(tokenPrice),
        softCap: this.stablecoinService.parse(this.createForm1.value.softCap),
        minInvestment: this.getMinInvestmentValue(hasMinAndMaxInvestment),
        maxInvestment: this.getMaxInvestmentValue(hasMinAndMaxInvestment, data),
        whitelistRequired: this.createForm1.value.isIdVerificationRequired,
      },
      flavor: this.createForm1.value.flavor as CampaignFlavor,
      tokenPrice: tokenPrice,
      hardCap: this.createForm1.value.hardCap,
      hardCapTokens: hardCapTokens,
      hardCapTokensPercentage: this.createForm1.value.hardCapTokensPercentage,
      softCapTokens: softCapTokens,
      softCapTokensPercentage: this.softCapTokensPercentage(data),
    }
  }
}

enum Step {
  CREATION_FIRST, CREATION_SECOND, PREVIEW
}

interface AssetData {
  asset: CommonAssetWithInfo,
  balance: BigNumber,
}

interface CampaignPreview {
  info: Omit<CampaignUploadInfoData, 'photo' | 'documents'> & { photo?: File }
  data: Omit<CreateCampaignData, 'info'>
  flavor: CampaignFlavor,
  tokenPrice: number
  hardCap: number
  hardCapTokens: number
  hardCapTokensPercentage: number
  softCapTokens: number
  softCapTokensPercentage: number
}
