import {ChangeDetectionStrategy, Component} from '@angular/core'
import {withStatus} from '../shared/utils/observables'
import {SessionQuery} from '../session/state/session.query'
import {PortfolioItem, QueryService} from '../shared/services/blockchain/query.service'
import {map, shareReplay, switchMap, tap} from 'rxjs/operators'
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs'
import {DialogService} from '../shared/services/dialog.service'
import {StablecoinBigNumber, StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {CampaignService, CampaignWithInfo} from '../shared/services/blockchain/campaign/campaign.service'
import {CampaignFlavor} from '../shared/services/blockchain/flavors'
import {constants} from 'ethers'
import {AutoInvestService} from '../shared/services/backend/auto-invest.service'

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioComponent {
  portfolioSub = new BehaviorSubject<void>(undefined)

  portfolio$: Observable<PortfolioItemView[]> = this.portfolioSub.asObservable().pipe(
    switchMap(() => this.queryService.portfolio$),
    switchMap(portfolio => portfolio.length > 0 ? combineLatest(
      portfolio.map(item => this.campaignService.getCampaignInfo(item.campaign).pipe(
        map(i => ({...item, campaign: i})),
      )),
    ) : of([])),
    shareReplay({bufferSize: 1, refCount: true}),
  )
  portfolioWithStatus$ = withStatus(this.portfolio$)

  totalInvested$: Observable<{ value: StablecoinBigNumber }> = this.portfolio$.pipe(
    map(portfolio => portfolio.length > 0 ?
      portfolio.map(item => item.tokenValue).reduce((prev, curr) => prev.add(curr)) : constants.Zero),
    map(v => ({value: v})),
  )

  pendingAutoInvest$ = this.autoInvestService.status().pipe(
    map(res => res.auto_invests.length > 0 ? res.auto_invests[0] : undefined),
  )

  constructor(private sessionQuery: SessionQuery,
              private queryService: QueryService,
              private dialogService: DialogService,
              private stablecoin: StablecoinService,
              private autoInvestService: AutoInvestService,
              private campaignService: CampaignService) {
  }

  cancel(contractAddress: string, flavor: CampaignFlavor | string) {
    return () => {
      return this.campaignService.cancelInvestment(contractAddress, flavor as CampaignFlavor).pipe(
        switchMap(() => this.dialogService.success('Investment has been cancelled successfully.')),
        tap(() => this.portfolioSub.next()),
      )
    }
  }
}

interface PortfolioItemView extends PortfolioItem {
  campaign: CampaignWithInfo;
}
