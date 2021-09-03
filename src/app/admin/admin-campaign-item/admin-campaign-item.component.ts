import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-admin-campaign-item',
  templateUrl: './admin-campaign-item.component.html',
  styleUrls: ['./admin-campaign-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCampaignItemComponent implements OnInit {
  @Input() asset!: AssetWithInfo | FtAssetWithInfo
  @Input() campaign!: CampaignWithInfo
  @Input() type!: 'list-item' | 'detail'

  campaignData!: CampaignData

  constructor(private campaignService: CampaignService,) {
  }

  ngOnInit(): void {
    const stats = this.campaignService.stats(this.campaign)
    const location = window.location
    const issuerPath = location.pathname.split('/admin')[0]
    const campaignUrl = `${location.protocol}//${location.host}${issuerPath}/offers/${this.campaign.ansName}`

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
