import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {InvestService, PreInvestData} from '../shared/services/invest.service'
import {CampaignService, CampaignWithInfo} from '../shared/services/blockchain/campaign/campaign.service'
import {constants} from 'ethers'
import {StablecoinBigNumber, StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {combineLatest, Observable, of} from 'rxjs'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors} from '@angular/forms'
import {CampaignFlavor} from '../shared/services/blockchain/flavors'
import {ActivatedRoute} from '@angular/router'
import {map, shareReplay, startWith, switchMap, take, tap} from 'rxjs/operators'
import {WithStatus, withStatus} from '../shared/utils/observables'
import {DialogService} from '../shared/services/dialog.service'
import {SessionQuery} from '../session/state/session.query'
import {NameService} from '../shared/services/blockchain/name.service'
import {RouterService} from '../shared/services/router.service'
import {ConversionService} from '../shared/services/conversion.service'
import {AssetService, CommonAssetWithInfo} from '../shared/services/blockchain/asset/asset.service'
import {SignerService} from '../shared/services/signer.service'

@Component({
  selector: 'app-invest',
  templateUrl: './invest.component.html',
  styleUrls: ['./invest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestComponent {
  state$!: Observable<InvestmentState>
  stateWithStatus$!: Observable<WithStatus<InvestmentState>>

  shouldApprove$: Observable<boolean>
  shouldBuy$: Observable<boolean>

  investmentForm: FormGroup

  isUserLoggedIn$ = this.sessionQuery.isLoggedIn$
  bigNumberConstants = constants

  constructor(private fb: FormBuilder,
              private campaignService: CampaignService,
              private assetService: AssetService,
              private nameService: NameService,
              private sessionQuery: SessionQuery,
              private signerService: SignerService,
              private stablecoin: StablecoinService,
              private conversion: ConversionService,
              private dialogService: DialogService,
              private investService: InvestService,
              private router: RouterService,
              private route: ActivatedRoute) {
    const campaignId = this.route.snapshot.params.id
    const campaignWithName$ = this.nameService.getCampaign(campaignId).pipe(
      shareReplay(1),
    )

    const campaign$: Observable<CampaignWithInfo> = campaignWithName$.pipe(
      switchMap(campaignWithName => this.campaignService.getCommonStateChanges$(
        campaignWithName.campaign.contractAddress, campaignWithName.campaign,
      )),
      switchMap(campaignCommon => this.campaignService.getCampaignInfo(campaignCommon)),
      shareReplay(1),
    )

    const preInvestData$: Observable<PreInvestData> = combineLatest([
      this.sessionQuery.address$,
      campaign$,
    ]).pipe(
      switchMap(([_address, campaign]) => this.investService.preInvestData(campaign)),
      tap(stats => {
        if (stats.min === stats.max) this.investmentForm.setValue({stablecoinAmount: stats.min})
      }),
      shareReplay(1),
    )

    this.state$ = campaign$.pipe(
      switchMap(campaign => combineLatest([
        of(this.stablecoin.symbol),
        this.stablecoin.balance$,
        this.stablecoin.getAllowance$(campaign.contractAddress),
        of(campaign),
        this.assetService.getAssetWithInfo(campaign.asset, true),
        preInvestData$,
      ])),
      map(([stablecoinSymbol, stablecoinBalance, stablecoinAllowance, campaign, asset, preInvestData]) => ({
        stablecoinSymbol, stablecoinBalance, stablecoinAllowance, campaign, asset, preInvestData,
      })),
      tap(() => {
        this.investmentForm.get('stablecoinAmount')?.updateValueAndValidity()
        // TODO: fix updating validator function
      }),
      shareReplay(1),
    )
    this.stateWithStatus$ = withStatus(this.state$)

    this.investmentForm = this.fb.group({
      stablecoinAmount: ['0'],
      tokenAmount: ['0'],
    }, {
      asyncValidators: this.amountValidator.bind(this),
    })

    this.shouldApprove$ = combineLatest([
      this.isUserLoggedIn$,
      this.investmentForm.get('stablecoinAmount')!.valueChanges.pipe(
        startWith('0'),
      ),
      this.state$,
    ]).pipe(
      map(([isUserLoggedIn, stablecoinAmount, state]) => {
        if (!isUserLoggedIn) return false

        const amount = this.conversion.toStablecoin(stablecoinAmount)

        return state.stablecoinAllowance.lt(amount)
      }),
      shareReplay(1),
    )

    this.shouldBuy$ = combineLatest([
      this.isUserLoggedIn$,
      this.shouldApprove$,
    ]).pipe(
      map(([isUserLoggedIn, shouldApprove]) => {
        return isUserLoggedIn && !shouldApprove
      }),
      shareReplay(1),
    )
  }

  onStablecoinAmountChange(campaign: CampaignWithInfo) {
    const stablecoinAmount = this.conversion.toStablecoin(this.investmentForm.value.stablecoinAmount)
    const tokenAmount = this.conversion.calcTokens(stablecoinAmount, campaign.pricePerToken)

    this.investmentForm.patchValue({
      tokenAmount: this.conversion.parseToken(tokenAmount).replace(/(\.0$)/, ''),
    })
  }

  onTokenAmountChange(campaign: CampaignWithInfo) {
    const tokenAmount = this.conversion.toToken(this.investmentForm.value.tokenAmount)
    const stablecoinAmount = this.conversion.calcStablecoin(tokenAmount, campaign.pricePerToken)

    this.investmentForm.patchValue({
      stablecoinAmount: this.conversion.parseStablecoin(stablecoinAmount).replace(/(\.0$)/, ''),
    })
  }

  approveAmount(campaign: CampaignWithInfo) {
    return () => {
      const amount = this.conversion.toStablecoin(this.investmentForm.value.stablecoinAmount)

      return this.stablecoin.approveAmount(campaign.contractAddress, amount)
    }
  }

  invest(campaign: CampaignWithInfo) {
    return () => {
      return this.campaignService.invest(
        campaign.contractAddress,
        campaign.flavor as CampaignFlavor,
        this.conversion.toStablecoin(this.investmentForm.value.stablecoinAmount),
      ).pipe(
        switchMap(() => this.router.navigate(['/portfolio'])),
      )
    }
  }

  private amountValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return combineLatest([this.state$]).pipe(take(1),
      map(([data]) => {
        const stablecoinAmount = this.conversion.toStablecoin(control.value.stablecoinAmount || 0)
        const tokenAmount = this.conversion.toToken(control.value.tokenAmount || 0)

        if (data.preInvestData.max.isZero()) {
          return {campaignMaxReached: true}
        } else if (data.stablecoinBalance === undefined) {
          return {userNotLoggedIn: true}
        } else if (stablecoinAmount.lte(constants.Zero)) {
          return {stablecoinAmountBelowZero: true}
        } else if (tokenAmount.lte(constants.Zero)) {
          return {tokenAmountBelowZero: true}
        } else if (data.preInvestData.userInvestGap.isZero()) {
          return {userMaxReached: true}
        } else if (data.stablecoinBalance.isZero()) {
          return {walletBalanceTooLow: true}
        } else if (stablecoinAmount.lt(data.preInvestData.min)) {
          return {stablecoinAmountBelowMin: true}
        } else if (stablecoinAmount.gt(data.preInvestData.max)) {
          return {stablecoinAmountAboveMax: true}
        } else if (stablecoinAmount.gt(data.stablecoinBalance)) {
          return {stablecoinAmountAboveBalance: true}
        }

        return null
      }),
      tap(() => ɵmarkDirty(this)),
    )
  }

  login(): Observable<unknown> {
    return this.signerService.ensureAuth
  }
}

interface InvestmentState {
  stablecoinSymbol: string,
  stablecoinBalance: StablecoinBigNumber | undefined,
  stablecoinAllowance: StablecoinBigNumber,
  campaign: CampaignWithInfo,
  asset: CommonAssetWithInfo,
  preInvestData: PreInvestData,
}
