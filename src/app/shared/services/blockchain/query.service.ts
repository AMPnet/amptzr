import {Injectable} from '@angular/core'
import {QueryService__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {filter, map, switchMap} from 'rxjs/operators'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {combineLatest, Observable, of} from 'rxjs'
import {CampaignService, CampaignState, CampaignWithInfo} from './campaign.service'
import {BigNumber} from 'ethers'

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  contract$ = combineLatest([
    this.preferenceQuery.network$,
    this.sessionQuery.provider$,
  ]).pipe(
    map(([network, provider]) =>
      QueryService__factory.connect(network.tokenizerConfig.queryService, provider)),
  )

  offers$: Observable<CampaignState[]> = combineLatest([
    this.contract$,
    this.preferenceQuery.issuer$,
    this.preferenceQuery.network$,
  ]).pipe(
    switchMap(([contract, issuer, network]) =>
      contract.getCampaignsForIssuer(issuer.address, network.tokenizerConfig.cfManagerFactory.basic)),
  )

  portfolio$: Observable<PortfolioItem[]> = combineLatest([
    this.contract$,
    this.preferenceQuery.issuer$,
    this.preferenceQuery.network$,
    this.sessionQuery.address$,
  ]).pipe(
    filter(([_contract, _issuer, _network, address]) => !!address),
    switchMap(([contract, issuer, network, address]) =>
      contract.getCampaignsForIssuerInvestor(issuer.address, address!,
        network.tokenizerConfig.cfManagerFactory.basic) as Promise<PortfolioStateItem[]>),
    switchMap(portfolio => portfolio.length === 0 ? of([]) : combineLatest(
      portfolio.map(portfolio => this.campaignService.getCampaignInfo(portfolio.campaign).pipe(
        map(campaignWithInfo => ({...portfolio, campaign: campaignWithInfo})),
      ))),
    ),
    map(portfolio => portfolio.filter(item => item.tokenAmount > BigNumber.from(0))),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private campaignService: CampaignService) {
  }
}

interface PortfolioInvested {
  tokenAmount: BigNumber;
  tokenValue: BigNumber;
}

interface PortfolioStateItem extends PortfolioInvested {
  campaign: CampaignState;
}

interface PortfolioItem extends PortfolioInvested {
  campaign: CampaignWithInfo;
}
