import { Injectable } from '@angular/core'
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs'
import {
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators'
import { ERC20__factory } from '../../../../../types/ethers-contracts'
import { SessionQuery } from '../../../session/state/session.query'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { BigNumber, constants } from 'ethers'
import { contractEvent } from '../../utils/ethersjs'
import { IssuerService } from './issuer/issuer.service'
import { NameService } from './name.service'
import { IssuerFlavor } from './flavors'
import { switchMapTap } from '../../utils/observables'

@Injectable({
  providedIn: 'root',
})
export class StablecoinService {
  contract$ = combineLatest([
    this.preferenceQuery.issuer$.pipe(
      switchMap((issuer) => this.nameService.getIssuer(issuer.address))
    ),
    this.sessionQuery.provider$,
  ]).pipe(
    distinctUntilChanged(),
    switchMap(([issuer, provider]) =>
      this.issuerService
        .getState(
          issuer.issuer.contractAddress,
          issuer.issuer.flavor as IssuerFlavor
        )
        .pipe(
          map((issuer) => ERC20__factory.connect(issuer.stablecoin, provider))
        )
    ),
    switchMapTap((contract) =>
      of(contract).pipe(
        switchMap((contract) =>
          combineLatest([
            of(contract.address),
            contract.decimals(),
            contract.symbol(),
          ])
        ),
        tap(([address, decimals, symbol]) => {
          this.configSub.next({ address, decimals, symbol })
        })
      )
    )
  )

  private configSub = new BehaviorSubject<StablecoinConfig>({
    address: constants.AddressZero,
    decimals: 6,
    symbol: 'USDC',
  })

  balance$: Observable<BigNumber | undefined> = combineLatest([
    this.contract$,
    this.preferenceQuery.address$,
  ]).pipe(
    switchMap(([contract, address]) =>
      !address
        ? of(undefined)
        : merge(
            of(undefined),
            contractEvent(contract, contract.filters.Transfer(address)),
            contractEvent(contract, contract.filters.Transfer(null, address))
          ).pipe(switchMap(() => contract.balanceOf(address)))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  constructor(
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private nameService: NameService,
    private issuerService: IssuerService
  ) {}

  get config() {
    return this.configSub.value
  }
}

/**
 * StablecoinBigNumber is a regular BigNumber, but scaled to stablecoin format.
 */
export type StablecoinBigNumber = BigNumber

export interface StablecoinConfig {
  address: string
  decimals: number
  symbol: string
}
