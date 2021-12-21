import {Injectable} from '@angular/core'
import {combineLatest, Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {StablecoinBigNumber, StablecoinService} from './blockchain/stablecoin.service'
import {CampaignService} from './blockchain/campaign/campaign.service'
import {CampaignCommonStateWithName} from './blockchain/query.service'
import {CampaignFlavor} from './blockchain/flavors'
import {constants} from 'ethers'
import {BigNumberMin} from '../utils/ethersjs'

@Injectable({
  providedIn: 'root',
})
export class InvestService {
  constructor(private stablecoin: StablecoinService,
              private campaignService: CampaignService,
  ) {
  }

  preInvestData(campaign: CampaignCommonStateWithName): Observable<PreInvestData> {
    const balance$ = this.stablecoin.balance$
    const alreadyInvested$ = this.campaignService.alreadyInvested(campaign.campaign.contractAddress)
    const stats$ = this.campaignService.stats(
      campaign.campaign.contractAddress, campaign.campaign.flavor as CampaignFlavor,
    )

    return combineLatest([balance$, alreadyInvested$, stats$]).pipe(
      map(([walletBalance, alreadyInvested, campaignStats]) => {
        const userInvestGap = campaignStats.userMax.sub(alreadyInvested)

        const max = BigNumberMin(userInvestGap, campaignStats.valueToInvest)
        const min = BigNumberMin(
          alreadyInvested.gt(constants.Zero) ? constants.Zero : campaignStats.userMin,
          userInvestGap,
          max,
        )

        return {
          min, max,
          walletBalance,
          userInvestGap,
        }
      }),
    )
  }

  // private floorDecimals(value: number): number {
  //   return Math.floor(value * 100) / 100
  // }
}

export interface PreInvestData {
  min: StablecoinBigNumber
  max: StablecoinBigNumber
  walletBalance: StablecoinBigNumber | undefined
  userInvestGap: StablecoinBigNumber
}
