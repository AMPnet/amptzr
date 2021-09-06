import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'

@Component({
  selector: 'app-admin-campaign-item',
  templateUrl: './admin-campaign-item.component.html',
  styleUrls: ['./admin-campaign-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCampaignItemComponent implements OnInit {
  @Input() asset!: AssetWithInfo | FtAssetWithInfo
  @Input() campaign!: CampaignWithInfo
  @Input() type!: 'view-screen' | 'edit-screen'

  campaignData!: CampaignData

  constructor(private campaignService: CampaignService,
              private issuerPathPipe: IssuerPathPipe) {
  }

  ngOnInit(): void {
    const stats = this.campaignService.stats(this.campaign)
    const campaignUrl = window.location.origin + this.issuerPathPipe.transform(`/offers/${this.campaign.ansName}`)

    this.campaignData = {
      url: campaignUrl,
      total: stats.valueTotal,
      tokenPrice: stats.tokenPrice,
      tokensPercentage: this.campaign.totalTokensBalance.div(this.asset.initialTokenSupply).toNumber()
    }
  }
}

interface CampaignData {
  url: string
  total: number
  tokenPrice: number
  tokensPercentage: number
}
