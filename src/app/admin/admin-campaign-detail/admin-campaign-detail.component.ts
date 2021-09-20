import {ChangeDetectionStrategy, Component} from '@angular/core'
import {combineLatest, Observable, of} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {BigNumber} from 'ethers'
import {CampaignService, CampaignStats, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {ActivatedRoute} from '@angular/router'
import {resolveAddress} from '../../shared/utils/ethersjs'
import {map, switchMap, tap} from 'rxjs/operators'
import {quillMods} from '../../shared/utils/quill'
import {PercentPipe} from '@angular/common'
import {LinkPreviewResponse, LinkPreviewService} from '../../shared/services/backend/link-preview.service'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {DialogService} from '../../shared/services/dialog.service'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset/asset.service'

@Component({
  selector: 'app-admin-campaign-detail',
  templateUrl: './admin-campaign-detail.component.html',
  styleUrls: ['./admin-campaign-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignDetailComponent {
  campaignData$: Observable<WithStatus<{
    asset: AssetWithInfo,
    assetBalance: BigNumber,
    campaign: CampaignWithInfo,
    stats: CampaignStats,
  }>>

  links$!: Observable<WithStatus<{ value: LinkPreviewResponse[] }>>

  quillMods = quillMods

  constructor(private assetService: AssetService,
              private campaignService: CampaignService,
              private percentPipe: PercentPipe,
              private linkPreviewService: LinkPreviewService,
              private stablecoinService: StablecoinService,
              private dialogService: DialogService,
              private route: ActivatedRoute) {
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

    this.links$ = campaign$.pipe(
      switchMap((campaign) => {
        if (!campaign.newsURLs) {
          return withStatus(of({value: []}))
        }

        const previewLinks = campaign.newsURLs?.map((url) => this.linkPreviewService.previewLink(url))

        return withStatus(combineLatest(previewLinks).pipe(map(value => ({value}))))
      }),
    )
  }

  hardCapTokensPercentage(stats: CampaignStats, asset: AssetWithInfo) {
    const pricePerToken = stats.tokenPrice
    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = stats.valueTotal / pricePerToken
    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(asset.initialTokenSupply, 18)
    return numOfTokensToSell / totalTokens
  }

  softCapTokensPercentage(stats: CampaignStats, asset: AssetWithInfo) {
    const pricePerToken = stats.tokenPrice
    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = stats.softCap / pricePerToken
    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(asset.initialTokenSupply, 18)
    return numOfTokensToSell / totalTokens
  }

  shouldShowMin(stats: CampaignStats) {
    return stats.userMin > 0
  }

  shouldShowMax(stats: CampaignStats) {
    return stats.userMax < stats.valueTotal
  }

  returnFrequency(campaign: CampaignWithInfo) {
    switch (campaign.return?.frequency) {
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
    return !!campaign.return?.frequency
  }

  returnValue(campaign: CampaignWithInfo) {
    if (campaign.return?.to) {
      const returnFrom = this.percentPipe.transform(campaign.return.from)
      const returnTo = this.percentPipe.transform(campaign.return.to)
      return `From ${returnFrom} to ${returnTo}`
    }

    return this.percentPipe.transform(campaign.return?.from?.toString())
  }

  finalize(campaign: CampaignWithInfo) {
    return () => {
      return this.campaignService.finalize(campaign.contractAddress).pipe(
        switchMap(() => this.dialogService.success('The project has been finalized successfully.')),
        tap(() => campaign.finalized = true),
      )
    }
  }
}
