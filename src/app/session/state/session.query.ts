import {Injectable} from '@angular/core'
import {Query} from '@datorama/akita'
import {SessionState, SessionStore} from './session.store'
import {map, tap} from 'rxjs/operators'
import {ethers} from 'ethers'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {EthersNetworks} from '../../shared/networks'

@Injectable({providedIn: 'root'})
export class SessionQuery extends Query<SessionState> {
  address$ = this.select('address');
  provider$ = this.select('provider').pipe(
    map(provider => {
      if (!provider) {
        const newProvider = ethers.getDefaultProvider(
          EthersNetworks[this.preferenceQuery.getValue().chainID]
        )
        this.store.update({provider: newProvider})
        return newProvider as ethers.providers.Provider
      }

      return provider
    }),
  );

  isLoggedIn$ = this.select().pipe(
    map(this.stateIsLoggedIn)
  );

  constructor(protected store: SessionStore,
              private preferenceQuery: PreferenceQuery) {
    super(store)

    preferenceQuery.select('chainID').pipe(
      map(chainID => ethers.getDefaultProvider(EthersNetworks[chainID])),
      tap(provider => store.update({provider}))
    ).subscribe()
  }

  stateIsLoggedIn(state: SessionState): boolean {
    return !!state.address &&
      !!state.signer
  }

  get signer(): ethers.providers.JsonRpcSigner | undefined {
    return this.store._value().signer
  }

  isLoggedIn(): boolean {
    return this.stateIsLoggedIn(this.store._value())
  }
}
