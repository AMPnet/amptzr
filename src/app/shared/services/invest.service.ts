import {Injectable} from '@angular/core'
import {combineLatest, Observable} from 'rxjs'
import {map, shareReplay, take} from 'rxjs/operators'
import {formatEther} from 'ethers/lib/utils'
import {StablecoinService} from './blockchain/stablecoin.service'
import {CampaignService} from './blockchain/campaign.service'

@Injectable({
  providedIn: 'root',
})
export class InvestService {
  constructor(private stablecoin: StablecoinService,
              private campaignService: CampaignService,
  ) {
  }

  preInvestData(campaignAddress: string): Observable<PreInvestData> {
    const campaign$ = this.campaignService.getCampaignWithInfo(campaignAddress).pipe(shareReplay(1))
    const balance$ = combineLatest([this.stablecoin.balance$]).pipe(take(1), map(([balance]) => balance))
    const alreadyInvested$ = this.campaignService.alreadyInvested(campaignAddress)

    return combineLatest([campaign$, balance$, alreadyInvested$]).pipe(
      map(([campaign, balance, alreadyInvested]) => {
        const walletBalance = Number(formatEther(balance))
        const campaignStats = this.campaignService.stats(campaign)

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
