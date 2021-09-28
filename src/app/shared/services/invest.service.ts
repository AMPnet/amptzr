import {Injectable} from '@angular/core'
import {combineLatest, Observable} from 'rxjs'
import {map, take} from 'rxjs/operators'
import {StablecoinService} from './blockchain/stablecoin.service'
import {CampaignService} from './blockchain/campaign/campaign.service'
import {CampaignCommonStateWithName} from './blockchain/query.service'
import {CampaignFlavor} from './blockchain/flavors'

@Injectable({
  providedIn: 'root',
})
export class InvestService {
  constructor(private stablecoin: StablecoinService,
              private campaignService: CampaignService,
  ) {
  }

  preInvestData(campaign: CampaignCommonStateWithName): Observable<PreInvestData> {
    const balance$ = combineLatest([this.stablecoin.balance$]).pipe(take(1), map(([balance]) => balance))
    const alreadyInvested$ = this.campaignService.alreadyInvested(campaign.campaign.contractAddress)
    const stats$ = this.campaignService.stats(
      campaign.campaign.contractAddress, campaign.campaign.flavor as CampaignFlavor,
    )

    return combineLatest([balance$, alreadyInvested$, stats$]).pipe(
      map(([balance, alreadyInvested, campaignStats]) => {
        const walletBalance = this.stablecoin.format(balance)
        const userInvestGap = this.floorDecimals(campaignStats.userMax - alreadyInvested)

        const max = Math.min(userInvestGap, this.floorDecimals(campaignStats.valueToInvest))
        const min = Math.min(alreadyInvested > 0 ? 0 : campaignStats.userMin, userInvestGap, max)

        return {
          min, max,
          walletBalance,
          userInvestGap,
        }
      }),
    )
  }

  private floorDecimals(value: number): number {
    return Math.floor(value * 100) / 100
  }
}

export interface PreInvestData {
  min: number,
  max: number,
  walletBalance: number
  userInvestGap: number
}
