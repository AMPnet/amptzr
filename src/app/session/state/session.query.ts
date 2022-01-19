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
    // Use this for testing
    // tap(provider => {
    //   provider.on('debug', info => {
    //     console.log(info.request.method)
    //     console.log(info.request.params[0]?.to)
    //     console.log(info.request.params[0]?.from)
    //     console.log(info.request.params[0]?.data)
    //   })
    // })
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

    this.preferenceQuery.select(['address', 'authProvider']).pipe(
      tap(pref => {
        if (!pref.address || !pref.authProvider) {
          store.update({
            signer: undefined,
          })
        }
      }),
    ).subscribe()
  }

  stateIsLoggedIn(state: SessionState): boolean {
    return !!state.signer
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
