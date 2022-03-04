import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {distinctUntilChanged, map, shareReplay, switchMap} from 'rxjs/operators'
import {ERC20__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'

@Injectable({
  providedIn: 'root',
})
export class Erc20Service {
  constructor(private sessionQuery: SessionQuery) {
  }

  getData(address: string): Observable<ERC20TokenData> {
    return this.sessionQuery.provider$.pipe(
      map(provider => ERC20__factory.connect(address, provider)),
      switchMap(contract => combineLatest([
        of(contract.address),
        from(contract.name()),
        from(contract.symbol()),
        from(contract.decimals()),
      ])),
      map(([address, name, symbol, decimals]) => ({
        address, name, symbol, decimals,
      })),
      distinctUntilChanged((p, c) => JSON.stringify(p) === JSON.stringify(c)),
      shareReplay(1),
    )
  }
}

export interface ERC20TokenData {
  address: string
  name: string
  symbol: string
  decimals: number
}
