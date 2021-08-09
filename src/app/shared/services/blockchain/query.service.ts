import {Injectable} from '@angular/core'
import {QueryService__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {map, switchMap} from 'rxjs/operators'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {combineLatest, Observable} from 'rxjs'
import {CampaignState} from './campaign.service'

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
      contract.getCampaignsForIssuer(issuer.address, network.tokenizerConfig.cfManagerFactory)),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery) {
  }
}
