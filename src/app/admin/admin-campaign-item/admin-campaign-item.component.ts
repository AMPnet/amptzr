import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {CommonAssetWithInfo} from '../../shared/services/blockchain/asset/asset.service'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign/campaign.service'
import {CampaignFlavor} from '../../shared/services/blockchain/flavors'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'

@Component({
  selector: 'app-admin-campaign-item',
  templateUrl: './admin-campaign-item.component.html',
  styleUrls: ['./admin-campaign-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignItemComponent implements OnInit {
  @Input() asset!: CommonAssetWithInfo
  @Input() campaign!: CampaignWithInfo
  @Input() type!: 'view-screen' | 'edit-screen'

  campaignData$!: Observable<CampaignData>

  constructor(private campaignService: CampaignService,
              private stablecoinService: StablecoinService) {
  }

  ngOnInit(): void {
    this.campaignData$ = this.campaignService.stats(
      this.campaign.contractAddress, this.campaign.flavor as CampaignFlavor,
    ).pipe(
      map(stats => {
        const assetTokens = this.stablecoinService.format(this.asset.totalSupply, 18)

        return {
          total: stats.valueTotal,
          tokenPrice: stats.tokenPrice,
          campaignTokens: stats.tokenBalance,
          assetTokens: assetTokens,
          tokensPercentage: stats.tokenBalance / assetTokens,
        }
      }),
    )
  }
}

interface CampaignData {
  total: number
  tokenPrice: number
  campaignTokens: number
  assetTokens: number
  tokensPercentage: number
}
