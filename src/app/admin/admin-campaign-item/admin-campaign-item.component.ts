import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'

@Component({
  selector: 'app-admin-campaign-item',
  templateUrl: './admin-campaign-item.component.html',
  styleUrls: ['./admin-campaign-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignItemComponent implements OnInit {
  @Input() asset!: AssetWithInfo | FtAssetWithInfo
  @Input() campaign!: CampaignWithInfo
  @Input() type!: 'view-screen' | 'edit-screen'

  campaignData!: CampaignData

  constructor(private campaignService: CampaignService,
              private stablecoinService: StablecoinService) {
  }

  ngOnInit(): void {
    const stats = this.campaignService.stats(this.campaign)
    const assetTokens = this.stablecoinService.format(this.asset.initialTokenSupply, 18)

    this.campaignData = {
      total: stats.valueTotal,
      tokenPrice: stats.tokenPrice,
      campaignTokens: stats.tokenBalance,
      assetTokens: assetTokens,
      tokensPercentage: stats.tokenBalance / assetTokens,
    }
  }
}

interface CampaignData {
  total: number
  tokenPrice: number
  campaignTokens: number
  assetTokens: number
  tokensPercentage: number
}
