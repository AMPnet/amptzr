import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {getWindow} from '../../shared/utils/browser'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'

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
              private stablecoinService: StablecoinService,
              private issuerPathPipe: IssuerPathPipe) {
  }

  ngOnInit(): void {
    const stats = this.campaignService.stats(this.campaign)
    const campaignUrl = getWindow().location.origin + this.issuerPathPipe.transform(`/offers/${this.campaign.ansName}`)

    this.campaignData = {
      url: campaignUrl,
      total: stats.valueTotal,
      tokenPrice: stats.tokenPrice,
      tokensPercentage: stats.tokenBalance / this.stablecoinService.format(this.asset.initialTokenSupply, 18)
    }
  }
}

interface CampaignData {
  url: string
  total: number
  tokenPrice: number
  tokensPercentage: number
}
