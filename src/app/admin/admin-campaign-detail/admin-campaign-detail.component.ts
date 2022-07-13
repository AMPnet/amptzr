import { ChangeDetectionStrategy, Component } from '@angular/core'
import { combineLatest, Observable, of } from 'rxjs'
import { withStatus, WithStatus } from '../../shared/utils/observables'
import { BigNumber } from 'ethers'
import { ActivatedRoute } from '@angular/router'
import { map, switchMap, tap } from 'rxjs/operators'
import { quillMods } from '../../shared/utils/quill'
import { PercentPipe } from '@angular/common'
import {
  LinkPreviewResponse,
  LinkPreviewService,
} from '../../shared/services/backend/link-preview.service'
import { StablecoinService } from '../../shared/services/blockchain/stablecoin.service'
import { DialogService } from '../../shared/services/dialog.service'
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
import {
  CampaignBasicService,
  CampaignBasicState,
} from '../../shared/services/blockchain/campaign/campaign-basic.service'
import { ConversionService } from '../../shared/services/conversion.service'

@Component({
  selector: 'app-admin-campaign-detail',
  templateUrl: './admin-campaign-detail.component.html',
  styleUrls: ['./admin-campaign-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignDetailComponent {
  campaignData$: Observable<
    WithStatus<{
      asset: CommonAssetWithInfo
      assetBalance: BigNumber
      campaign: CampaignWithInfo
      stats: CampaignStats
      campaignBasic: CampaignBasicState | undefined
    }>
  >

  links$!: Observable<WithStatus<{ value: LinkPreviewResponse[] }>>

  quillMods = quillMods

  constructor(
    private assetService: AssetService,
    private campaignService: CampaignService,
    private campaignBasicService: CampaignBasicService,
    private percentPipe: PercentPipe,
    private nameService: NameService,
    private linkPreviewService: LinkPreviewService,
    private stablecoinService: StablecoinService,
    private conversion: ConversionService,
    private dialogService: DialogService,
    private route: ActivatedRoute
  ) {
    const campaignId = this.route.snapshot.params.campaignId
    const campaign$ = this.nameService
      .getCampaign(campaignId)
      .pipe(
        switchMap((campaign) =>
          this.campaignService.getCampaignInfo(campaign.campaign, true)
        )
      )

    this.campaignData$ = withStatus(
      campaign$.pipe(
        switchMap((campaign) =>
          combineLatest([
            this.assetService.getAssetWithInfo(campaign.asset, true),
            this.assetService.balance(campaign.asset),
            this.campaignService.stats(
              campaign.contractAddress,
              campaign.flavor as CampaignFlavor
            ),
            this.campaignBasicService.getStateFromCommon(campaign),
          ]).pipe(
            map(([asset, assetBalance, stats, campaignBasic]) => ({
              asset,
              assetBalance,
              campaign,
              stats,
              campaignBasic,
            }))
          )
        )
      )
    )

    this.links$ = campaign$.pipe(
      switchMap((campaign) => {
        if (!campaign.infoData.newsURLs) {
          return withStatus(of({ value: [] }))
        }

        const previewLinks = campaign.infoData.newsURLs?.map((url) =>
          this.linkPreviewService.previewLink(url)
        )

        return withStatus(
          combineLatest(previewLinks).pipe(map((value) => ({ value })))
        )
      })
    )
  }

  hardCapTokensPercentage(stats: CampaignStats, asset: CommonAssetWithInfo) {
    const tokens = this.conversion.calcTokens(
      stats.valueTotal,
      stats.tokenPrice
    )

    return (
      this.conversion.parseTokenToNumber(tokens) /
      this.conversion.parseTokenToNumber(asset.totalSupply)
    )
  }

  softCapTokensPercentage(stats: CampaignStats, asset: CommonAssetWithInfo) {
    const tokens = this.conversion.calcTokens(stats.softCap, stats.tokenPrice)

    return (
      this.conversion.parseTokenToNumber(tokens) /
      this.conversion.parseTokenToNumber(asset.totalSupply)
    )
  }

  shouldShowMin(stats: CampaignStats) {
    // TODO: should be set to userMin > 0
    //  this is a workaround for campaigns that are incorrectly set.
    return stats.userMin.gte(this.conversion.toStablecoin(1))
  }

  shouldShowMax(stats: CampaignStats) {
    return stats.userMax.lt(stats.valueTotal)
  }

  returnFrequency(campaign: CampaignWithInfo) {
    switch (campaign.infoData.return?.frequency) {
      case 'annual':
        return 'Annually'
      case 'semi-annual':
        return 'Semi-annually'
      case 'quarterly':
        return 'Quarterly'
      case 'monthly':
        return 'Monthly'
      default:
        return 'No'
    }
  }

  isReturningProfits(campaign: CampaignWithInfo) {
    return !!campaign.infoData.return?.frequency
  }

  returnValue(campaign: CampaignWithInfo) {
    if (campaign.infoData.return?.to) {
      const returnFrom = this.percentPipe.transform(
        campaign.infoData.return.from,
        '1.0-2'
      )
      const returnTo = this.percentPipe.transform(
        campaign.infoData.return.to,
        '1.0-2'
      )
      return `From ${returnFrom} to ${returnTo}`
    }

    return this.percentPipe.transform(
      campaign.infoData.return?.from?.toString(),
      '1.0-2'
    )
  }

  finalize(campaign: CampaignWithInfo) {
    return () => {
      return this.campaignService
        .finalize(campaign.contractAddress, campaign.flavor as CampaignFlavor)
        .pipe(
          switchMap(() =>
            this.dialogService.success({
              message: 'The project has been finalized.',
            })
          ),
          tap(() => (campaign.finalized = true)) // TODO: this could result in bad behavior in some cases
        )
    }
  }
}
