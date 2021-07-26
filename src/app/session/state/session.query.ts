import {Injectable} from '@angular/core'
import {Query} from '@datorama/akita'
import {SessionState, SessionStore} from './session.store'
import {filter, map, take, tap} from 'rxjs/operators'
import {getDefaultProvider, providers} from 'ethers'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {EthersNetworks} from '../../shared/networks'
import {Observable} from 'rxjs'

@Injectable({providedIn: 'root'})
export class SessionQuery extends Query<SessionState> {
  address$ = this.select('address')
  authProvider$ = this.select('authProvider')
  provider$ = this.select('provider').pipe(
    map(provider => {
      if (!provider) {
        const newProvider = getDefaultProvider(
          EthersNetworks[this.preferenceQuery.getValue().chainID],
        )
        this.store.update({provider: newProvider})
        return newProvider as providers.Provider
      }

      return provider
    }),
  )

  isLoggedIn$ = this.select().pipe(
    map(this.stateIsLoggedIn),
  )

  constructor(protected store: SessionStore,
              private preferenceQuery: PreferenceQuery) {
    super(store)

    preferenceQuery.select('chainID').pipe(
      map(chainID => getDefaultProvider(EthersNetworks[chainID])),
      tap(provider => store.update({provider})),
    ).subscribe()
  }

  stateIsLoggedIn(state: SessionState): boolean {
    return !!state.address &&
      !!state.signer
  }

  get signer(): providers.JsonRpcSigner | undefined {
    return this.store._value().signer
  }

  get provider(): providers.Provider {
    return this.store._value().provider!
  }

  isLoggedIn(): boolean {
    return this.stateIsLoggedIn(this.store._value())
  }

  waitUntilLoggedIn(): Observable<boolean> {
    return this.isLoggedIn$.pipe(filter(isLoggedIn => isLoggedIn), take(1))
  }
}
