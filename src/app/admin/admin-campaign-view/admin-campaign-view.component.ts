import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {CampaignService, CampaignStats, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'
import {getWindow} from '../../shared/utils/browser'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {quillMods} from 'src/app/shared/utils/quill'
import {combineLatest, Observable, of} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {LinkPreviewResponse, LinkPreviewService} from '../../shared/services/backend/link-preview.service'
import {map, switchMap, tap} from 'rxjs/operators'
import {PercentPipe} from '@angular/common'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {DialogService} from '../../shared/services/dialog.service'
import {BigNumber} from 'ethers'

@Component({
  selector: 'app-admin-campaign-view',
  templateUrl: './admin-campaign-view.component.html',
  styleUrls: ['./admin-campaign-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignViewComponent implements OnInit {
  @Input() campaign!: CampaignWithInfo
  @Input() assetData!: {
    asset: AssetWithInfo | FtAssetWithInfo,
    balance: BigNumber,
  }

  links$!: Observable<WithStatus<{ value: LinkPreviewResponse[] }>>
  campaignData!: CampaignData

  quillMods = quillMods

  constructor(private issuerPathPipe: IssuerPathPipe,
              private percentPipe: PercentPipe,
              private linkPreviewService: LinkPreviewService,
              private stablecoinService: StablecoinService,
              private dialogService: DialogService,
              private campaignService: CampaignService) {
  }

  ngOnInit() {
    const campaignUrl = getWindow().location.origin + this.issuerPathPipe.transform(`/offers/${this.campaign.ansName}`)

    this.campaignData = {
      url: campaignUrl,
      stats: this.campaignService.stats(this.campaign),
    }

    this.links$ = of(this.campaign).pipe(
      switchMap((campaign) => {
        console.log(campaign)
        if (!campaign.newsURLs) {
          return withStatus(of({value: []}))
        }

        const previewLinks = campaign.newsURLs?.map((url) => this.linkPreviewService.previewLink(url))

        return withStatus(combineLatest(previewLinks).pipe(map(value => ({value}))))
      }),
    )
  }

  get hardCapTokensPercentage() {
    const pricePerToken = this.campaignData.stats.tokenPrice
    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = this.campaignData.stats.valueTotal / pricePerToken
    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(this.assetData.asset.initialTokenSupply, 18)
    return numOfTokensToSell / totalTokens
  }

  get softCapTokensPercentage() {
    const pricePerToken = this.campaignData.stats.tokenPrice
    if (pricePerToken === 0) {
      return 0
    }

    const numOfTokensToSell = this.campaignData.stats.softCap / pricePerToken
    if (numOfTokensToSell === 0) {
      return 0
    }

    const totalTokens = this.stablecoinService.format(this.assetData.asset.initialTokenSupply, 18)
    return numOfTokensToSell / totalTokens
  }

  get shouldShowMin() {
    // TODO: should be set to userMin > 0
    //  this is a workaround for campaigns that are incorrectly set.
    return this.campaignData.stats.userMin > 1
  }

  get shouldShowMax() {
    return this.campaignData.stats.userMax < this.campaignData.stats.valueTotal
  }

  get returnFrequency() {
    switch (this.campaign.return?.frequency) {
      case 'annual':
        return 'Anually'
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

  get isReturningProfits() {
    return !!this.campaign.return?.frequency
  }

  get returnValue() {
    if (this.campaign.return?.to) {
      const returnFrom = this.percentPipe.transform(this.campaign.return.from)
      const returnTo = this.percentPipe.transform(this.campaign.return.to)
      return `From ${returnFrom} to ${returnTo}`
    }

    return this.percentPipe.transform(this.campaign.return?.from?.toString())
  }

  finalize() {
    return this.campaignService.finalize(this.campaign.contractAddress).pipe(
      switchMap(() => this.dialogService.success('The project has been finalized successfully.')),
      tap(() => this.campaign.finalized = true),
    )
  }
}

interface CampaignData {
  url: string
  stats: CampaignStats
}
