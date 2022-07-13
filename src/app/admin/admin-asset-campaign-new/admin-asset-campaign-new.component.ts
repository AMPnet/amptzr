import { ChangeDetectionStrategy, Component, ɵmarkDirty } from '@angular/core'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { getWindow } from '../../shared/utils/browser'
import { IssuerPathPipe } from '../../shared/pipes/issuer-path.pipe'
import { DatePipe, PercentPipe, ViewportScroller } from '@angular/common'
import { BigNumber, constants } from 'ethers'
import {
  StablecoinBigNumber,
  StablecoinService,
} from '../../shared/services/blockchain/stablecoin.service'
import { quillMods } from '../../shared/utils/quill'
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators'
import { RouterService } from '../../shared/services/router.service'
import { DialogService } from '../../shared/services/dialog.service'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { withStatus, WithStatus } from '../../shared/utils/observables'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../../shared/services/blockchain/asset/asset.service'
import {
  CampaignService,
  CampaignUploadInfoData,
  CreateCampaignData,
} from '../../shared/services/blockchain/campaign/campaign.service'
import { NameService } from '../../shared/services/blockchain/name.service'
import { CampaignFlavor } from '../../shared/services/blockchain/flavors'
import { dateToIsoString } from '../../shared/utils/date'
import { ReturnFrequency } from '../../../../types/ipfs/campaign'
import { ConversionService } from '../../shared/services/conversion.service'
import { FormatUnitPipe } from '../../shared/pipes/format-unit.pipe'

@Component({
  selector: 'app-admin-asset-campaign-new',
  templateUrl: './admin-asset-campaign-new.component.html',
  styleUrls: ['./admin-asset-campaign-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetCampaignNewComponent {
  state$: Observable<State>
  stateWithStatus$: Observable<WithStatus<State>>

  campaignFlavor = CampaignFlavor
  campaignFactory =
    this.preferenceQuery.network.tokenizerConfig.cfManagerFactory

  stepType = Step
  step$ = new BehaviorSubject<Step>(Step.CREATION_FIRST)

  createForm1: FormGroup
  createForm2: FormGroup
  newsUrls: FormArray
  preview!: CampaignPreview

  quillMods = quillMods

  readonly returnFrequencyNames: { [key in ReturnFrequency]: string } = {
    [ReturnFrequency.MONTHLY]: 'Monthly',
    [ReturnFrequency.QUARTERLY]: 'Quarterly',
    [ReturnFrequency.SEMI_ANNUALLY]: 'Semi-annually',
    [ReturnFrequency.ANNUALLY]: 'Annually',
  }

  constructor(
    private campaignService: CampaignService,
    private nameService: NameService,
    private viewportScroller: ViewportScroller,
    private preferenceQuery: PreferenceQuery,
    private issuerPathPipe: IssuerPathPipe,
    private datePipe: DatePipe,
    private percentPipe: PercentPipe,
    private formatUnitPipe: FormatUnitPipe,
    private stablecoinService: StablecoinService,
    private conversion: ConversionService,
    private route: ActivatedRoute,
    private assetService: AssetService,
    private routerService: RouterService,
    private dialogService: DialogService,
    private fb: FormBuilder
  ) {
    const assetId = this.route.snapshot.params.id
    const asset$ = this.nameService
      .getAsset(assetId)
      .pipe(
        switchMap((asset) =>
          this.assetService.getAssetWithInfo(asset.asset.contractAddress, true)
        )
      )
    const userTokenBalance$ = asset$.pipe(
      switchMap((asset) => this.assetService.balance(asset.contractAddress))
    )

    this.state$ = combineLatest([asset$, userTokenBalance$]).pipe(
      map(([asset, userTokenBalance]) => ({ asset, userTokenBalance })),
      shareReplay(1)
    )
    this.stateWithStatus$ = withStatus(this.state$)

    this.createForm1 = this.fb.group(
      {
        name: ['', Validators.required],
        slug: [
          '',
          [
            Validators.required,
            Validators.pattern('[A-Za-z0-9][A-Za-z0-9_-]*'),
          ],
        ],
        hardCap: [0, Validators.required],
        softCap: [0, Validators.required],
        tokenPrice: [0, Validators.required],
        hasMinAndMaxInvestment: [false, Validators.required],
        minInvestment: [
          { value: undefined, disabled: true },
          Validators.required,
        ],
        maxInvestment: [
          { value: undefined, disabled: true },
          Validators.required,
        ],
        isReturningProfitsToInvestors: [false, Validators.required],
        returnFrequency: [{ value: '', disabled: true }, Validators.required],
        isReturnValueFixed: [false, Validators.required],
        returnFrom: [
          { value: undefined, disabled: true },
          [Validators.required, Validators.min(0.01), Validators.max(1)],
        ],
        returnTo: [
          { value: undefined, disabled: true },
          [Validators.required, Validators.min(0.01), Validators.max(1)],
        ],
        isIdVerificationRequired: [false, Validators.required],
        flavor: [CampaignFlavor.BASIC, Validators.required],
      },
      {
        validators: [AdminAssetCampaignNewComponent.validReturnFromTo],
        asyncValidators: [this.validMonetaryValues.bind(this)],
      }
    )

    this.createForm2 = this.fb.group(
      {
        logo: [undefined, Validators.required],
        about: ['', Validators.required],
        description: ['', Validators.required],
        startDate: [undefined],
        endDate: [undefined],
        documentUpload: [undefined],
        documents: [[]],
        newsUrls: this.fb.array([]),
      },
      {
        validators: [AdminAssetCampaignNewComponent.validDateRange],
      }
    )

    this.newsUrls = this.createForm2.get('newsUrls') as FormArray
  }

  get campaignUrl() {
    return (
      getWindow().location.origin + this.issuerPathPipe.transform(`/offers/`)
    )
  }

  allocationFromTotalSupply(stablecoin: number | string, state: State): number {
    const tokenPrice = this.conversion.toTokenPrice(
      this.createForm1.value.tokenPrice
    )
    if (tokenPrice.eq(constants.Zero)) return 0

    const softCap = this.conversion.toStablecoin(stablecoin)
    const tokensToSell = this.conversion.calcTokens(softCap, tokenPrice)

    return (
      this.conversion.parseTokenToNumber(tokensToSell) /
      this.conversion.parseTokenToNumber(state.asset.totalSupply)
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

  previewCampaignStep(state: State) {
    this.preparePreviewData(state)
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
    this.newsUrls.push(
      this.fb.control('', [Validators.required, Validators.pattern('[^\\s]*')])
    )
  }

  removeNewsUrl(index: number) {
    this.newsUrls.removeAt(index)
    this.newsUrls.markAsDirty()
  }

  create(state: State) {
    return () => {
      return this.campaignService.uploadInfo(this.preview.info).pipe(
        switchMap((uploadRes) =>
          this.campaignService.create(
            {
              ...this.preview.data,
              info: uploadRes.path,
            },
            this.preview.flavor
          )
        ),
        switchMap((campaignAddress) =>
          this.dialogService
            .success({
              message: `Campaign has been created. You will be asked to sign a transaction to
            transfer your ${state.asset.symbol} tokens to the campaign.`,
            })
            .pipe(
              switchMap(() =>
                this.addTokensToCampaign(campaignAddress!, state)
              ),
              switchMap(() =>
                this.dialogService.success({
                  message: 'Tokens added to the campaign.',
                })
              ),
              switchMap(() =>
                this.routerService.navigate([
                  `/admin/campaigns/${campaignAddress}`,
                ])
              )
            )
        )
      )
    }
  }

  previewDateRange() {
    if (!!this.preview.info.startDate && !!this.preview.info.endDate) {
      return `${this.formatDate(
        this.preview.info.startDate
      )} - ${this.formatDate(this.preview.info.endDate)}`
    }

    if (!!this.preview.info.startDate) {
      return `From ${this.formatDate(this.preview.info.startDate)}`
    }

    if (!!this.preview.info.endDate) {
      return `Until ${this.formatDate(this.preview.info.endDate)}`
    }

    return 'Not specified'
  }

  previewReturn() {
    if (this.preview.info.return.frequency) {
      const frequency =
        this.returnFrequencyNames[this.preview.info.return.frequency]
      const from = this.percentPipe.transform(this.preview.info.return.from)

      if (this.preview.info.return.to) {
        const to = this.percentPipe.transform(this.preview.info.return.to)
        return `${frequency} from ${from} to ${to}`
      }

      return `${frequency} at ${from}`
    }

    return 'No'
  }

  private validMonetaryValues(
    control: FormGroup
  ): Observable<ValidationErrors | null> {
    return combineLatest([this.state$]).pipe(
      take(1),
      map(([state]) => {
        const hardCap = this.conversion.toStablecoin(control.value.hardCap || 0)
        const softCap = this.conversion.toStablecoin(control.value.softCap || 0)
        const tokenPrice = this.conversion.toTokenPrice(
          control.value.tokenPrice || 0
        )

        if (hardCap.lte(constants.Zero)) {
          return { hardCapBelowZero: true }
        } else if (tokenPrice.lte(constants.Zero)) {
          return { tokenPriceBelowZero: true }
        }

        const hardCapTokens = this.conversion.calcTokens(hardCap, tokenPrice)
        if (hardCapTokens.gt(state.userTokenBalance)) {
          return { hardCapAboveUserBalance: true }
        }

        if (softCap.lte(constants.Zero)) {
          return { softCapBelowZero: true }
        } else if (softCap.gt(hardCap)) {
          return { softCapOverHardCap: true }
        }

        if (control.value.hasMinAndMaxInvestment) {
          const min = this.conversion.toStablecoin(
            control.value.minInvestment || 0
          )
          const max = this.conversion.toStablecoin(
            control.value.maxInvestment || 0
          )

          if (min.lt(constants.Zero)) {
            return { minBelowZero: true }
          } else if (min.gt(max)) {
            return { minOverMax: true }
          } else if (max.lte(constants.Zero)) {
            return { maxBelowZero: true }
          } else if (max.gt(hardCap)) {
            return { maxOverHardCap: true }
          }
        }

        return null
      }),
      tap(() => ɵmarkDirty(this))
    )
  }

  private static validReturnFromTo(
    formGroup: FormGroup
  ): ValidationErrors | null {
    if (formGroup.value.isReturningProfitsToInvestors) {
      const returnFrom = formGroup.value.returnFrom
      if (returnFrom <= 0 || returnFrom > 1) {
        return { invalidReturnFrom: true }
      }

      if (!formGroup.value.isReturnValueFixed) {
        const returnTo = formGroup.value.returnTo
        if (returnTo <= 0 || returnTo > 1) {
          return { invalidReturnTo: true }
        }

        if (returnFrom >= returnTo) {
          return { invalidReturnFromToRange: true }
        }
      }
    }

    return null
  }

  private static validDateRange(formGroup: FormGroup): ValidationErrors | null {
    const startDate = formGroup.value.startDate
    const endDate = formGroup.value.endDate
    if (!!startDate && !!endDate && startDate > endDate) {
      return { invalidDateRange: true }
    }

    return null
  }

  private createCampaignReturnObject(): {
    frequency?: ReturnFrequency
    from?: number
    to?: number
  } {
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

  private getMinInvestmentValue(
    hasMinAndMaxInvestment: boolean
  ): StablecoinBigNumber {
    if (hasMinAndMaxInvestment) {
      return this.conversion.toStablecoin(this.createForm1.value.minInvestment)
    }

    return BigNumber.from(constants.Zero)
  }

  private getMaxInvestmentValue(hasMinAndMaxInvestment: boolean, state: State) {
    if (hasMinAndMaxInvestment) {
      return this.conversion.toStablecoin(this.createForm1.value.maxInvestment)
    }

    const tokenPrice = this.conversion.toTokenPrice(
      this.createForm1.value.tokenPrice
    )

    return this.conversion.calcStablecoin(state.asset.totalSupply, tokenPrice)
  }

  private addTokensToCampaign(campaignAddress: string, state: State) {
    return this.assetService.transferTokensToCampaign(
      state.asset.contractAddress,
      campaignAddress,
      this.preview.hardCap,
      this.preview.data.initialPricePerToken
    )
  }

  private formatDate(value?: string): string | null {
    return this.datePipe.transform(value, 'mediumDate')
  }

  private preparePreviewData(state: State) {
    const hasMinAndMaxInvestment: boolean =
      this.createForm1.value.hasMinAndMaxInvestment

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
        assetAddress: state.asset.contractAddress,
        initialPricePerToken: this.conversion.toTokenPrice(
          this.createForm1.value.tokenPrice
        ),
        softCap: this.conversion.toStablecoin(this.createForm1.value.softCap),
        minInvestment: this.getMinInvestmentValue(hasMinAndMaxInvestment),
        maxInvestment: this.getMaxInvestmentValue(
          hasMinAndMaxInvestment,
          state
        ),
        whitelistRequired: this.createForm1.value.isIdVerificationRequired,
      },
      flavor: this.createForm1.value.flavor as CampaignFlavor,
      hardCap: this.conversion.toStablecoin(this.createForm1.value.hardCap),
    }
  }
}

enum Step {
  CREATION_FIRST,
  CREATION_SECOND,
  PREVIEW,
}

interface State {
  asset: CommonAssetWithInfo
  userTokenBalance: BigNumber
}

interface CampaignPreview {
  info: Omit<CampaignUploadInfoData, 'photo' | 'documents'> & { photo?: File }
  data: Omit<CreateCampaignData, 'info'>
  flavor: CampaignFlavor
  hardCap: StablecoinBigNumber
}
