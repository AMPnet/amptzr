import {Injectable} from '@angular/core'
import {combineLatest, Observable, of} from 'rxjs'
import {map, shareReplay, switchMap} from 'rxjs/operators'
import {ERC20__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {IssuerService} from './issuer.service'
import {BigNumber} from 'ethers'

@Injectable({
  providedIn: 'root',
})
export class StablecoinService {
  contract$ = combineLatest([
    this.preferenceQuery.issuer$,
    this.sessionQuery.provider$,
  ]).pipe(
    switchMap(([issuer, provider]) => this.issuerService.getState(issuer.address, provider).pipe(
      map(state => ERC20__factory.connect(state.stablecoin, provider)),
    )),
  )

  balance$: Observable<BigNumber> = combineLatest([
    this.contract$,
    this.sessionQuery.address$,
  ]).pipe(
    switchMap(([contract, address]) => address ? contract.balanceOf(address) : of(BigNumber.from(0))),
  )

  symbol$ = this.contract$.pipe(
    switchMap(contract => contract.symbol()),
    shareReplay(1),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private issuerService: IssuerService) {
  }
}
