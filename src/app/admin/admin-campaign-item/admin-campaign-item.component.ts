import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core'
import { StablecoinBigNumber } from '../../shared/services/blockchain/stablecoin.service'
import { CommonAssetWithInfo } from '../../shared/services/blockchain/asset/asset.service'
import {
  CampaignService,
  CampaignWithInfo,
} from '../../shared/services/blockchain/campaign/campaign.service'
import { CampaignFlavor } from '../../shared/services/blockchain/flavors'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { TokenBigNumber } from '../../shared/utils/token'
import { TokenPriceBigNumber } from '../../shared/utils/token-price'
import { constants } from 'ethers'
import { ConversionService } from '../../shared/services/conversion.service'

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

  bigNumberConstants = constants

  constructor(
    private campaignService: CampaignService,
    private conversion: ConversionService
  ) {}

  ngOnInit(): void {
    this.campaignData$ = this.campaignService
      .stats(
        this.campaign.contractAddress,
        this.campaign.flavor as CampaignFlavor
      )
      .pipe(
        map((stats) => {
          return {
            total: stats.valueTotal,
            tokenPrice: stats.tokenPrice,
            campaignTokens: stats.tokenBalance,
            assetTokens: this.asset.totalSupply,
            tokensPercentage:
              this.conversion.parseTokenToNumber(stats.tokenBalance) /
              this.conversion.parseTokenToNumber(this.asset.totalSupply),
          }
        })
      )
  }
}

interface CampaignData {
  total: StablecoinBigNumber
  tokenPrice: TokenPriceBigNumber
  campaignTokens: TokenBigNumber
  assetTokens: TokenBigNumber
  tokensPercentage: number
}
