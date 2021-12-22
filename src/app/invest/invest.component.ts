import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {InvestService, PreInvestData} from '../shared/services/invest.service'
import {CampaignService, CampaignWithInfo} from '../shared/services/blockchain/campaign/campaign.service'
import {constants} from 'ethers'
import {StablecoinBigNumber, StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {combineLatest, Observable, of, throwError} from 'rxjs'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors} from '@angular/forms'
import {CampaignFlavor} from '../shared/services/blockchain/flavors'
import {ActivatedRoute} from '@angular/router'
import {map, shareReplay, switchMap, take, tap} from 'rxjs/operators'
import {WithStatus, withStatus} from '../shared/utils/observables'
import {DialogService} from '../shared/services/dialog.service'
import {AuthProvider} from '../preference/state/preference.store'
import {SessionQuery} from '../session/state/session.query'
import {NameService} from '../shared/services/blockchain/name.service'
import {RouterService} from '../shared/services/router.service'
import {ConversionService} from '../shared/services/conversion.service'
import {AssetService, CommonAssetWithInfo} from '../shared/services/blockchain/asset/asset.service'

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

  constructor(private fb: FormBuilder,
              private campaignService: CampaignService,
              private assetService: AssetService,
              private nameService: NameService,
              private sessionQuery: SessionQuery,
              private stablecoin: StablecoinService,
              private conversion: ConversionService,
              private dialogService: DialogService,
              private investService: InvestService,
              private router: RouterService,
              private route: ActivatedRoute) {
    const campaignId = this.route.snapshot.params.id
    const campaignCommon$ = this.nameService.getCampaign(campaignId).pipe(
      shareReplay(1),
    )

    const campaign$: Observable<CampaignWithInfo> = campaignCommon$.pipe(
      switchMap(campaignCommon => this.campaignService.getCampaignInfo(campaignCommon.campaign)),
      shareReplay(1),
    )

    const preInvestData$: Observable<PreInvestData> = campaignCommon$.pipe(
      switchMap(address => this.investService.preInvestData(address)),
      tap(stats => {
        if (stats.min === stats.max) this.investmentForm.setValue({stablecoinAmount: stats.min})
      }),
      shareReplay(1),
    )

    this.state$ = campaign$.pipe(
      switchMap(campaign => combineLatest([
        of(this.stablecoin.symbol),
        this.stablecoin.balance$,
        of(campaign),
        this.assetService.getAssetWithInfo(campaign.asset, true),
        preInvestData$,
      ])),
      map(([stablecoinSymbol, stablecoinBalance, campaign, asset, preInvestData]) => ({
        stablecoinSymbol, stablecoinBalance, campaign, asset, preInvestData,
      })),
      shareReplay(1)
    )
    this.stateWithStatus$ = withStatus(this.state$)

    this.investmentForm = this.fb.group({
      stablecoinAmount: [0],
      tokenAmount: [0],
    }, {
      asyncValidators: this.amountValidator.bind(this),
    })
  }

  onStablecoinAmountChange(campaign: CampaignWithInfo) {
    const stablecoinAmount = this.conversion.toStablecoin(this.investmentForm.value.stablecoinAmount)
    const tokenAmount = this.conversion.calcTokens(stablecoinAmount, campaign.pricePerToken)

    this.investmentForm.patchValue({tokenAmount: this.conversion.parseToken(tokenAmount)}, )
  }

  onTokenAmountChange(campaign: CampaignWithInfo) {
    const tokenAmount = this.conversion.toToken(this.investmentForm.value.tokenAmount)
    const stablecoinAmount = this.conversion.calcStablecoin(tokenAmount, campaign.pricePerToken)

    this.investmentForm.patchValue({stablecoinAmount: this.conversion.parseStablecoin(stablecoinAmount)})
  }

  private getAllowance(campaign: CampaignWithInfo): Observable<StablecoinBigNumber> {
    return this.stablecoin.getAllowance(campaign.contractAddress)
  }

  private approveFlow(campaign: CampaignWithInfo) {
    const approveAmount$ = this.approveAmount(campaign)
    switch (this.sessionQuery.getValue().authProvider) {
      case AuthProvider.MAGIC:
        return approveAmount$
      default:
        return this.dialogService.info(
          'You will be asked to sign the transaction to allow investment from your wallet.',
        ).pipe(
          switchMap(res => res ? approveAmount$ : throwError(() => 'USER_DISMISSED_APPROVE_FLOW')),
        )
    }
  }

  private approveAmount(campaign: CampaignWithInfo) {
    const amount = this.conversion.toStablecoin(this.investmentForm.value.stablecoinAmount)

    return this.stablecoin.approveAmount(campaign.contractAddress, amount)
  }

  invest(campaign: CampaignWithInfo) {
    return () => {
      return this.campaignService.invest(
        campaign.contractAddress,
        campaign.flavor as CampaignFlavor,
        this.investmentForm.value.amount,
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

        if (data.stablecoinBalance === undefined) {
          return {userNotLoggedIn: true}
        } else if (stablecoinAmount.lte(constants.Zero)) {
          return {stablecoinAmountBelowZero: true}
        } else if (tokenAmount.lte(constants.Zero)) {
          return {tokenAmountBelowZero: true}
        } else if (data.preInvestData.userInvestGap.isZero()) {
          return {userMaxReached: true}
        } else if (data.preInvestData.max.isZero()) {
          return {campaignMaxReached: true}
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
}

interface InvestmentState {
  stablecoinSymbol: string,
  stablecoinBalance: StablecoinBigNumber | undefined,
  campaign: CampaignWithInfo,
  asset: CommonAssetWithInfo,
  preInvestData: PreInvestData,
}
