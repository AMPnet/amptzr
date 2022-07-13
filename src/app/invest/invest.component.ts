import { ChangeDetectionStrategy, Component, ɵmarkDirty } from '@angular/core'
import { InvestService, PreInvestData } from '../shared/services/invest.service'
import {
  CampaignService,
  CampaignWithInfo,
} from '../shared/services/blockchain/campaign/campaign.service'
import { constants } from 'ethers'
import {
  StablecoinBigNumber,
  StablecoinService,
} from '../shared/services/blockchain/stablecoin.service'
import { combineLatest, concat, concatMap, Observable, of, timer } from 'rxjs'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
} from '@angular/forms'
import { CampaignFlavor } from '../shared/services/blockchain/flavors'
import { ActivatedRoute } from '@angular/router'
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators'
import { WithStatus, withStatus } from '../shared/utils/observables'
import { DialogService } from '../shared/services/dialog.service'
import { SessionQuery } from '../session/state/session.query'
import { NameService } from '../shared/services/blockchain/name.service'
import { RouterService } from '../shared/services/router.service'
import { ConversionService } from '../shared/services/conversion.service'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../shared/services/blockchain/asset/asset.service'
import { SignerService } from '../shared/services/signer.service'
import { IdentityService } from '../identity/identity.service'
import { DepositService } from '../deposit/deposit.service'
import { PreferenceQuery } from '../preference/state/preference.query'
import { UserService } from '../shared/services/user.service'
import { BigNumberMin } from '../shared/utils/ethersjs'
import { Erc20Service } from '../shared/services/blockchain/erc20.service'

@Component({
  selector: 'app-invest',
  templateUrl: './invest.component.html',
  styleUrls: ['./invest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestComponent {
  state$!: Observable<InvestmentState>
  stateWithStatus$!: Observable<WithStatus<InvestmentState>>

  investmentForm: FormGroup

  isUserLoggedIn$ = this.sessionQuery.isLoggedIn$
  shouldOnlyPassKyc$: Observable<boolean>
  shouldOnlyGetFunds$: Observable<boolean>
  shouldPassKycAndGetFunds$: Observable<boolean>
  shouldApprove$: Observable<boolean>
  shouldBuy$: Observable<boolean>

  bigNumberConstants = constants

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private assetService: AssetService,
    private nameService: NameService,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private signerService: SignerService,
    private stablecoin: StablecoinService,
    private erc20Service: Erc20Service,
    private conversion: ConversionService,
    private dialogService: DialogService,
    private depositService: DepositService,
    private investService: InvestService,
    private identityService: IdentityService,
    private userService: UserService,
    private router: RouterService,
    private route: ActivatedRoute
  ) {
    const campaignId = this.route.snapshot.params.id
    const campaignWithName$ = this.nameService
      .getCampaign(campaignId)
      .pipe(shareReplay(1))

    const campaign$: Observable<CampaignWithInfo> = campaignWithName$.pipe(
      switchMap((campaignWithName) =>
        this.campaignService.getCommonStateChanges$(
          campaignWithName.campaign.contractAddress,
          campaignWithName.campaign
        )
      ),
      switchMap((campaignCommon) =>
        this.campaignService.getCampaignInfo(campaignCommon)
      ),
      shareReplay(1)
    )

    const preInvestData$: Observable<PreInvestData> = combineLatest([
      this.preferenceQuery.address$,
      campaign$,
    ]).pipe(
      switchMap(([_address, campaign]) =>
        this.investService.preInvestData(campaign)
      ),
      shareReplay(1)
    )

    this.state$ = campaign$.pipe(
      switchMap((campaign) =>
        combineLatest([
          of(this.stablecoin.config.symbol),
          this.stablecoin.balance$,
          this.erc20Service.getAllowance$(
            campaign.stablecoin,
            campaign.contractAddress
          ),
          of(campaign),
          this.assetService.getAssetWithInfo(campaign.asset, true),
          preInvestData$,
        ])
      ),
      map(
        ([
          stablecoinSymbol,
          stablecoinBalance,
          stablecoinAllowance,
          campaign,
          asset,
          preInvestData,
        ]) => ({
          stablecoinSymbol,
          stablecoinBalance,
          stablecoinAllowance,
          campaign,
          asset,
          preInvestData,
        })
      ),
      distinctUntilChanged((p, c) => JSON.stringify(p) === JSON.stringify(c)),
      tap(() => {
        timer(0)
          .pipe(
            tap(() => {
              this.investmentForm
                .get('stablecoinAmount')!
                .updateValueAndValidity()
            })
          )
          .subscribe()
      }),
      shareReplay(1)
    )
    this.stateWithStatus$ = withStatus(this.state$)

    this.investmentForm = this.fb.group(
      {
        stablecoinAmount: [''],
        tokenAmount: [''],
      },
      {
        asyncValidators: this.amountValidator.bind(this),
      }
    )

    const stablecoinAmountChanged$ = this.investmentForm
      .get('stablecoinAmount')!
      .valueChanges.pipe(
        startWith(''),
        distinctUntilChanged((p, c) => p == c),
        shareReplay(1)
      )

    const shouldPassKYC$ = combineLatest([
      this.isUserLoggedIn$,
      this.state$,
      this.preferenceQuery.address$,
    ]).pipe(
      switchMap(([isUserLoggedIn, state]) => {
        if (!isUserLoggedIn) return of(false)

        return this.identityService
          .checkOnIssuer$(state.campaign)
          .pipe(map((kycPassed) => !kycPassed))
      }),
      distinctUntilChanged(),
      shareReplay(1)
    )

    const shouldGetFunds$ = combineLatest([
      this.isUserLoggedIn$,
      this.state$,
      stablecoinAmountChanged$,
    ]).pipe(
      map(([isUserLoggedIn, state, stablecoinAmount]) => {
        if (!isUserLoggedIn || !state.stablecoinBalance) return false

        const amount = this.conversion.toStablecoin(stablecoinAmount || 0)

        return state.stablecoinBalance.lt(amount)
      }),
      distinctUntilChanged(),
      shareReplay(1)
    )

    this.shouldOnlyPassKyc$ = combineLatest([
      shouldPassKYC$,
      shouldGetFunds$,
    ]).pipe(
      map(
        ([shouldPassKYC, shouldGetFunds]) => shouldPassKYC && !shouldGetFunds
      ),
      distinctUntilChanged()
    )

    this.shouldOnlyGetFunds$ = combineLatest([
      shouldPassKYC$,
      shouldGetFunds$,
    ]).pipe(
      map(
        ([shouldPassKYC, shouldGetFunds]) => !shouldPassKYC && shouldGetFunds
      ),
      distinctUntilChanged()
    )

    this.shouldPassKycAndGetFunds$ = combineLatest([
      shouldPassKYC$,
      shouldGetFunds$,
    ]).pipe(
      map(([shouldPassKYC, shouldGetFunds]) => shouldPassKYC && shouldGetFunds),
      distinctUntilChanged()
    )

    const preInvestStepsRequired$ = combineLatest([
      this.shouldOnlyPassKyc$,
      this.shouldOnlyGetFunds$,
      this.shouldPassKycAndGetFunds$,
    ]).pipe(
      map(
        ([shouldOnlyPassKyc, shouldOnlyGetFunds, shouldPassKycAndGetFunds]) =>
          shouldOnlyPassKyc || shouldOnlyGetFunds || shouldPassKycAndGetFunds
      ),
      distinctUntilChanged()
    )

    this.shouldApprove$ = combineLatest([
      this.isUserLoggedIn$,
      this.state$,
      preInvestStepsRequired$,
      stablecoinAmountChanged$,
    ]).pipe(
      map(
        ([isUserLoggedIn, state, preInvestStepsRequired, stablecoinAmount]) => {
          if (
            !isUserLoggedIn ||
            preInvestStepsRequired ||
            !state.stablecoinBalance
          )
            return false

          const amount = this.conversion.toStablecoin(stablecoinAmount || 0)

          if (state.stablecoinBalance.lt(amount)) return false

          return state.stablecoinAllowance.lt(amount)
        }
      ),
      distinctUntilChanged()
    )

    this.shouldBuy$ = combineLatest([
      this.isUserLoggedIn$,
      preInvestStepsRequired$,
      this.shouldApprove$,
    ]).pipe(
      map(([isUserLoggedIn, preInvestStepsRequired, shouldApprove]) => {
        return isUserLoggedIn && !preInvestStepsRequired && !shouldApprove
      }),
      distinctUntilChanged()
    )
  }

  onStablecoinAmountChange(campaign: CampaignWithInfo) {
    const stablecoinAmount = this.conversion.toStablecoin(
      this.investmentForm.value.stablecoinAmount
    )
    const tokenAmount = this.conversion.calcTokens(
      stablecoinAmount,
      campaign.pricePerToken
    )

    this.investmentForm.patchValue({
      tokenAmount: this.conversion
        .parseToken(tokenAmount)
        .replace(/(\.0$)/, ''),
    })
  }

  onTokenAmountChange(campaign: CampaignWithInfo) {
    const tokenAmount = this.conversion.toToken(
      this.investmentForm.value.tokenAmount
    )
    const stablecoinAmount = this.conversion.calcStablecoin(
      tokenAmount,
      campaign.pricePerToken
    )

    this.investmentForm.patchValue({
      stablecoinAmount: this.conversion
        .parseStablecoin(stablecoinAmount)
        .replace(/(\.0$)/, ''),
    })
  }

  approveAmount(campaign: CampaignWithInfo) {
    return () => {
      const amount = this.conversion.toStablecoin(
        this.investmentForm.value.stablecoinAmount
      )

      return this.userService.nativeTokenBalance$.pipe(
        filter(
          (balance) =>
            this.preferenceQuery.network.maxGasPrice === 0 ||
            balance.gt(constants.Zero)
        ),
        take(1),
        concatMap(() =>
          this.erc20Service.approveAmount(
            campaign.stablecoin,
            campaign.contractAddress,
            amount
          )
        )
      )
    }
  }

  invest(campaign: CampaignWithInfo) {
    return () => {
      return this.campaignService
        .invest(
          campaign.contractAddress,
          campaign.flavor as CampaignFlavor,
          this.conversion.toStablecoin(
            this.investmentForm.value.stablecoinAmount
          )
        )
        .pipe(tap(() => this.router.navigate(['/orders'])))
    }
  }

  private amountValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return combineLatest([this.state$]).pipe(
      take(1),
      map(([data]) => {
        const stablecoinAmount = this.conversion.toStablecoin(
          control.value.stablecoinAmount || 0
        )
        const tokenAmount = this.conversion.toToken(
          control.value.tokenAmount || 0
        )

        if (data.preInvestData.max.isZero()) {
          return { campaignMaxReached: true }
        } else if (data.stablecoinBalance === undefined) {
          return { userNotLoggedIn: true }
        } else if (stablecoinAmount.lte(constants.Zero)) {
          return { stablecoinAmountBelowZero: true }
        } else if (tokenAmount.lte(constants.Zero)) {
          return { tokenAmountBelowZero: true }
        } else if (data.preInvestData.userInvestGap.isZero()) {
          return { userMaxReached: true }
        } else if (stablecoinAmount.lt(data.preInvestData.min)) {
          return { stablecoinAmountBelowMin: true }
        } else if (stablecoinAmount.gt(data.preInvestData.max)) {
          return { stablecoinAmountAboveMax: true }
        } else if (stablecoinAmount.gt(data.stablecoinBalance)) {
          return { stablecoinAmountAboveBalance: true }
        } else if (data.stablecoinBalance.isZero()) {
          return { walletBalanceTooLow: true }
        }

        return null
      }),
      tap(() => ɵmarkDirty(this))
    )
  }

  login(): Observable<unknown> {
    return this.signerService.ensureAuth
  }

  passKyc(state: InvestmentState) {
    return () => {
      return this.identityService.ensureIdentityChecked(state.campaign)
    }
  }

  getFunds(state: InvestmentState) {
    return () => {
      const stablecoinAmount = this.conversion.toStablecoin(
        this.investmentForm.value.stablecoinAmount || 0
      )

      return this.depositService.ensureBalance(
        stablecoinAmount,
        state.campaign.contractAddress,
        state.preInvestData.min
      )
    }
  }

  passKycAndGetFunds(state: InvestmentState) {
    return () => {
      return concat(this.passKyc(state)(), this.getFunds(state)())
    }
  }

  setStablecoin(
    state: InvestmentState,
    target: 'min' | 'max' | 'maxAvailable'
  ) {
    if (!state.stablecoinBalance) return

    const targetValue = (() => {
      switch (target) {
        case 'min':
          return state.preInvestData.min
        case 'max':
          return state.preInvestData.max
        case 'maxAvailable':
          return BigNumberMin(state.stablecoinBalance!, state.preInvestData.max)
      }
    })()

    this.investmentForm.patchValue({
      stablecoinAmount: this.conversion
        .parseStablecoin(targetValue)
        .replace(/(\.0$)/, ''),
    })

    this.onStablecoinAmountChange(state.campaign)
  }
}

interface InvestmentState {
  stablecoinSymbol: string
  stablecoinBalance: StablecoinBigNumber | undefined
  stablecoinAllowance: StablecoinBigNumber
  campaign: CampaignWithInfo
  asset: CommonAssetWithInfo
  preInvestData: PreInvestData
}
