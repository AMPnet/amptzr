import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {CampaignService, CampaignStats, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {ActivatedRoute} from '@angular/router'
import {RouterService} from '../../shared/services/router.service'
import {DialogService} from '../../shared/services/dialog.service'
import {BigNumber} from 'ethers'
import {filter, map, switchMap, take, tap} from 'rxjs/operators'
import {combineLatest, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {resolveAddress} from '../../shared/utils/ethersjs'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset/asset.service'

@Component({
  selector: 'app-admin-campaign-add-tokens',
  templateUrl: './admin-campaign-add-tokens.component.html',
  styleUrls: ['./admin-campaign-add-tokens.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignAddTokensComponent {
  campaignData$: Observable<WithStatus<CampaignData>>

  fundingForm: FormGroup

  constructor(private campaignService: CampaignService,
              private preferenceQuery: PreferenceQuery,
              private issuerPathPipe: IssuerPathPipe,
              private stablecoinService: StablecoinService,
              private route: ActivatedRoute,
              private routerService: RouterService,
              private assetService: AssetService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    const campaignId = this.route.snapshot.params.campaignId
    const campaign$ = resolveAddress(campaignId, this.campaignService.getAddressByName(campaignId)).pipe(
      switchMap(address => this.campaignService.getCampaignWithInfo(address, true)),
    )

    this.campaignData$ = withStatus(
      campaign$.pipe(
        switchMap(campaign => combineLatest([
          this.assetService.getAssetWithInfo(campaign.asset, true),
          this.assetService.balance(campaign.asset),
        ]).pipe(
          map(([asset, assetBalance]) => ({
            asset,
            assetBalance,
            campaign,
            stats: this.campaignService.stats(campaign),
          })),
        )),
      ),
    )

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

    const totalTokens = this.stablecoinService.format(data.asset.initialTokenSupply, 18)
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
      filter(([campaignDataRes]) => !!campaignDataRes.value),
      map(([campaignDataRes]) => campaignDataRes.value!),
      map(data => {
        const amount = control.value

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
  asset: AssetWithInfo,
  assetBalance: BigNumber,
  campaign: CampaignWithInfo,
  stats: CampaignStats,
}
