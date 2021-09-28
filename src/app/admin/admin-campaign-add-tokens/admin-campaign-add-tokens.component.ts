import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {CampaignService, CampaignStats, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetService, FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'
import {FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {ActivatedRoute} from '@angular/router'
import {RouterService} from '../../shared/services/router.service'
import {DialogService} from '../../shared/services/dialog.service'
import {BigNumber} from 'ethers'
import {switchMap} from 'rxjs/operators'

@Component({
  selector: 'app-admin-campaign-add-tokens',
  templateUrl: './admin-campaign-add-tokens.component.html',
  styleUrls: ['./admin-campaign-add-tokens.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCampaignAddTokensComponent implements OnInit {
  @Input() campaign!: CampaignWithInfo
  @Input() assetData!: {
    asset: AssetWithInfo | FtAssetWithInfo,
    balance: BigNumber,
  }
  @Input() assetService!: AssetService | FtAssetService

  campaignStats!: CampaignStats

  fundingForm: FormGroup

  constructor(private campaignService: CampaignService,
              private preferenceQuery: PreferenceQuery,
              private issuerPathPipe: IssuerPathPipe,
              private stablecoinService: StablecoinService,
              private route: ActivatedRoute,
              private routerService: RouterService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.fundingForm = this.fb.group({
      amount: [0, [Validators.required]],
    }, {validators: [this.validFundingAmount.bind(this)]})
  }

  ngOnInit() {
    this.campaignStats = this.campaignService.stats(this.campaign)
  }

  get minAmountToReachSoftCap() {
    const currentCampaignTokenValue = this.campaignStats.tokenBalance * this.campaignStats.tokenPrice
    if (currentCampaignTokenValue < this.campaignStats.softCap) {
      return this.campaignStats.softCap - currentCampaignTokenValue
    }

    return 0
  }

  get maxFundingAmount() {
    return this.stablecoinService.format(this.assetData.balance, 18) * this.campaignStats.tokenPrice
  }

  get tokensPercentage() {
    const pricePerToken = this.campaignStats.tokenPrice
    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = this.fundingForm.value.amount / pricePerToken
    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(this.assetData.asset.initialTokenSupply, 18)
    return numOfTokensToSell / totalTokens
  }

  addTokens() {
    return this.assetService.transferTokensToCampaign(
      this.assetData.asset.contractAddress,
      this.campaign.contractAddress,
      this.fundingTokensAmount
    ).pipe(
      switchMap(() => this.dialogService.info('Tokens added to campaign.', false)),
      switchMap(() => this.routerService.navigate(['..'], {relativeTo: this.route})),
    )
  }

  private validFundingAmount(): ValidationErrors | null {
    if (!this.assetData || !this.campaignStats) {
      return {notYetInitialized: true}
    }

    const fundingTokens = this.fundingTokensAmount

    const minTokens = this.minAmountToReachSoftCap / this.campaignStats.tokenPrice
    if (fundingTokens < minTokens) {
      return {fundingAmountTooLow: true}
    }

    const maxTokens = this.maxFundingAmount / this.campaignStats.tokenPrice
    if (fundingTokens > maxTokens) {
      return {fundingAmountTooHigh: true}
    }

    return null
  }

  private get fundingTokensAmount() {
    const tokenBalance = this.stablecoinService.format(this.assetData.balance)
    // Due to possible rounding errors, we use min(specifiedFundingTokens, assetTokenBalance) to ensure that valid
    // amount is always sent here.
    return Math.min(this.fundingForm.value.amount / this.campaignStats.tokenPrice, tokenBalance)
  }
}
