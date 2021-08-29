import {ChangeDetectionStrategy, Component} from '@angular/core'
import {withStatus} from '../shared/utils/observables'
import {SessionQuery} from '../session/state/session.query'
import {QueryService} from '../shared/services/blockchain/query.service'
import {map, shareReplay, switchMap, tap} from 'rxjs/operators'
import {BehaviorSubject, Observable} from 'rxjs'
import {CampaignService} from '../shared/services/blockchain/campaign.service'
import {DialogService} from '../shared/services/dialog.service'
import {StablecoinService} from '../shared/services/blockchain/stablecoin.service'

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioComponent {
  portfolioSub = new BehaviorSubject<void>(undefined)

  portfolio$ = this.portfolioSub.asObservable().pipe(
    switchMap(() => this.queryService.portfolio$),
    shareReplay({bufferSize: 1, refCount: true}),
  )
  portfolioWithStatus$ = withStatus(this.portfolio$)

  totalInvested$: Observable<{ value: number }> = this.portfolio$.pipe(
    map(portfolio => portfolio.length > 0 ?
      portfolio.map(item => this.stablecoin.format(item.tokenValue))
        .reduce((prev, curr) => prev + curr) : 0),
    map(v => ({value: v})),
  )

  constructor(private sessionQuery: SessionQuery,
              private queryService: QueryService,
              private dialogService: DialogService,
              private stablecoin: StablecoinService,
              private campaignService: CampaignService) {
  }

  cancel(contractAddress: string) {
    return () => {
      return this.campaignService.cancelInvestment(contractAddress).pipe(
        switchMap(() => this.dialogService.success('Investment has been cancelled successfully.')),
        tap(() => this.portfolioSub.next()),
      )
    }
  }
}
