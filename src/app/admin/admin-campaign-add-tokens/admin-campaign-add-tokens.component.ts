import { ChangeDetectionStrategy, Component, ɵmarkDirty } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { IssuerPathPipe } from '../../shared/pipes/issuer-path.pipe'
import {
  StablecoinBigNumber,
  StablecoinService,
} from '../../shared/services/blockchain/stablecoin.service'
import { ActivatedRoute } from '@angular/router'
import { RouterService } from '../../shared/services/router.service'
import { DialogService } from '../../shared/services/dialog.service'
import { BigNumber, constants } from 'ethers'
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators'
import { combineLatest, Observable } from 'rxjs'
import { withStatus, WithStatus } from '../../shared/utils/observables'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../../shared/services/blockchain/asset/asset.service'
import {
  CampaignService,
  CampaignStats,
  CampaignWithInfo,
} from '../../shared/services/blockchain/campaign/campaign.service'
import { NameService } from '../../shared/services/blockchain/name.service'
import { CampaignFlavor } from '../../shared/services/blockchain/flavors'
import { BigNumberMax } from '../../shared/utils/ethersjs'
import { ConversionService } from '../../shared/services/conversion.service'

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

  constructor(
    private campaignService: CampaignService,
    private nameService: NameService,
    private preferenceQuery: PreferenceQuery,
    private issuerPathPipe: IssuerPathPipe,
    private stablecoinService: StablecoinService,
    private route: ActivatedRoute,
    private routerService: RouterService,
    private assetService: AssetService,
    private dialogService: DialogService,
    private conversion: ConversionService,
    private fb: FormBuilder
  ) {
    const campaignId = this.route.snapshot.params.campaignId
    const campaign$ = this.nameService
      .getCampaign(campaignId)
      .pipe(
        switchMap((campaign) =>
          this.campaignService.getCampaignWithInfo(
            campaign.campaign.contractAddress,
            true
          )
        )
      )

    this.campaignData$ = campaign$.pipe(
      switchMap((campaign) =>
        combineLatest([
          this.assetService.getAssetWithInfo(campaign.asset, true),
          this.assetService.balance(campaign.asset),
          this.campaignService.stats(
            campaign.contractAddress,
            campaign.flavor as CampaignFlavor
          ),
        ]).pipe(
          map(([asset, assetBalance, stats]) => ({
            asset,
            assetBalance,
            campaign,
            stats,
            addTokenStats: this.addTokensStats(stats, assetBalance),
          }))
        )
      ),
      shareReplay(1)
    )

    this.campaignDataWithStatus$ = withStatus(this.campaignData$)

    this.fundingForm = this.fb.group(
      {
        amount: [0, [Validators.required]],
      },
      {
        asyncValidators: [this.validAmount.bind(this)],
      }
    )
  }

  addTokensStats(
    stats: CampaignStats,
    assetBalance: BigNumber
  ): AddTokensStats {
    return {
      min: BigNumberMax(constants.Zero, stats.softCap.sub(stats.valueTotal)),
      max: this.conversion.calcStablecoin(assetBalance, stats.tokenPrice),
    }
  }

  minAmountToReachSoftCap(stats: CampaignStats): StablecoinBigNumber {
    if (stats.valueTotal.lt(stats.softCap)) {
      return stats.softCap.sub(stats.valueTotal)
    }

    return constants.Zero
  }

  maxFundingAmount(data: CampaignData) {
    return this.conversion.calcStablecoin(
      data.assetBalance,
      data.stats.tokenPrice
    )
  }

  tokensPercentage(data: CampaignData): number {
    const amount = this.conversion.toStablecoin(this.fundingForm.value.amount)

    const tokenPrice = data.stats.tokenPrice
    if (tokenPrice.eq(constants.Zero)) return 0

    const tokens = this.conversion.calcTokens(amount, tokenPrice)

    return (
      this.conversion.parseTokenToNumber(tokens) /
      this.conversion.parseTokenToNumber(data.asset.totalSupply)
    )
  }

  addTokens(data: CampaignData) {
    return () => {
      return this.assetService
        .transferTokensToCampaign(
          data.asset.contractAddress,
          data.campaign.contractAddress,
          this.conversion.toStablecoin(this.fundingForm.value.amount),
          data.stats.tokenPrice
        )
        .pipe(
          switchMap(() =>
            this.dialogService.info({
              title: 'Tokens added to the campaign',
              cancelable: false,
            })
          ),
          switchMap(() =>
            this.routerService.navigate(['..'], { relativeTo: this.route })
          )
        )
    }
  }

  private validAmount(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return combineLatest([this.campaignData$]).pipe(
      take(1),
      map(([data]) => {
        const amount = this.conversion.toStablecoin(control.value.amount)

        if (amount.lte(constants.Zero)) {
          return { amountBelowZero: true }
        } else if (amount.lt(data.addTokenStats.min)) {
          return { amountBelowMin: true }
        } else if (amount.gt(data.addTokenStats.max)) {
          return { amountAboveMax: true }
        }

        return null
      }),
      tap(() => ɵmarkDirty(this))
    )
  }
}

interface CampaignData {
  asset: CommonAssetWithInfo
  assetBalance: BigNumber
  campaign: CampaignWithInfo
  stats: CampaignStats
  addTokenStats: AddTokensStats
}

interface AddTokensStats {
  min: StablecoinBigNumber
  max: StablecoinBigNumber
}
