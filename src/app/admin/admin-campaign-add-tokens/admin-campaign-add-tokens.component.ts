import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {ActivatedRoute} from '@angular/router'
import {RouterService} from '../../shared/services/router.service'
import {DialogService} from '../../shared/services/dialog.service'
import {BigNumber} from 'ethers'
import {map, shareReplay, switchMap, take, tap} from 'rxjs/operators'
import {combineLatest, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {AssetService, CommonAssetWithInfo} from '../../shared/services/blockchain/asset/asset.service'
import {
  CampaignService,
  CampaignStats,
  CampaignWithInfo,
} from '../../shared/services/blockchain/campaign/campaign.service'
import {NameService} from '../../shared/services/blockchain/name.service'
import {CampaignFlavor} from '../../shared/services/blockchain/flavors'

@Component({
  selector: 'app-admin-campaign-add-tokens',
  templateUrl: './admin-campaign-add-tokens.component.html',
  styleUrls: ['./admin-campaign-add-tokens.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignAddTokensComponent {
  campaignData$: Observable<CampaignData>
  campaignDataWithStatus$: Observable<WithStatus<CampaignData>>

  fundingForm: FormGroup

  constructor(private campaignService: CampaignService,
              private nameService: NameService,
              private preferenceQuery: PreferenceQuery,
              private issuerPathPipe: IssuerPathPipe,
              private stablecoinService: StablecoinService,
              private route: ActivatedRoute,
              private routerService: RouterService,
              private assetService: AssetService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    const campaignId = this.route.snapshot.params.campaignId
    const campaign$ = this.nameService.getCampaign(campaignId).pipe(
      switchMap(campaign => this.campaignService.getCampaignWithInfo(campaign.campaign.contractAddress, true)),
    )

    this.campaignData$ = campaign$.pipe(
      switchMap(campaign => combineLatest([
        this.assetService.getAssetWithInfo(campaign.asset, true),
        this.assetService.balance(campaign.asset),
        this.campaignService.stats(campaign.contractAddress, campaign.flavor as CampaignFlavor),
      ]).pipe(
        map(([asset, assetBalance, stats]) => ({
          asset,
          assetBalance,
          campaign,
          stats,
        })),
      )),
      shareReplay(1),
    )

    this.campaignDataWithStatus$ = withStatus(this.campaignData$)

    this.fundingForm = this.fb.group({
      amount: [0, [Validators.required], [this.validAmount.bind(this)]],
    })
  }

  minAmountToReachSoftCap(stats: CampaignStats) {
    const currentCampaignTokenValue = stats.tokenBalance * stats.tokenPrice
    if (currentCampaignTokenValue < stats.softCap) {
      return stats.softCap - currentCampaignTokenValue
    }

    return 0
  }

  maxFundingAmount(data: CampaignData) {
    return this.stablecoinService.format(data.assetBalance, 18) * data.stats.tokenPrice
  }

  tokensPercentage(data: CampaignData) {
    const pricePerToken = data.stats.tokenPrice
    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = this.fundingForm.value.amount / pricePerToken
    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(data.asset.totalSupply, 18)
    return numOfTokensToSell / totalTokens
  }

  addTokens(data: CampaignData) {
    return () => {
      return this.assetService.transferTokensToCampaign(
        data.asset.contractAddress,
        data.campaign.contractAddress,
        this.fundingTokensAmount(this.fundingForm.value.amount, data),
      ).pipe(
        switchMap(() => this.dialogService.info('Tokens added to campaign.', false)),
        switchMap(() => this.routerService.navigate(['..'], {relativeTo: this.route})),
      )
    }
  }

  private validAmount(control: AbstractControl): Observable<ValidationErrors | null> {
    return combineLatest([this.campaignData$]).pipe(take(1),
      map(([data]) => {
        const amount = control.value

        if (amount <= 0) {
          return {nonPositive: true}
        }

        const fundingTokens = this.fundingTokensAmount(amount, data)

        const minTokens = this.minAmountToReachSoftCap(data.stats) / data.stats.tokenPrice
        if (fundingTokens < minTokens) {
          return {fundingAmountTooLow: true}
        }

        const maxTokens = this.maxFundingAmount(data) / data.stats.tokenPrice
        if (fundingTokens > maxTokens) {
          return {fundingAmountTooHigh: true}
        }

        return null
      }),
      tap(() => ɵmarkDirty(this)),
    )
  }

  private fundingTokensAmount(amount: number, data: CampaignData) {
    const tokenBalance = this.stablecoinService.format(data.assetBalance)
    // Due to possible rounding errors, we use min(specifiedFundingTokens, assetTokenBalance) to ensure that valid
    // amount is always sent here.
    return Math.min(amount / data.stats.tokenPrice, tokenBalance)
  }
}

interface CampaignData {
  asset: CommonAssetWithInfo,
  assetBalance: BigNumber,
  campaign: CampaignWithInfo,
  stats: CampaignStats,
}
