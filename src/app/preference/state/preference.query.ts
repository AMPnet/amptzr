import { Injectable } from '@angular/core'
import { Query } from '@datorama/akita'
import { PreferenceState, PreferenceStore } from './preference.store'
import { map } from 'rxjs/operators'
import { Networks } from '../../shared/networks'
import { Observable } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class PreferenceQuery extends Query<PreferenceState> {
  address$ = this.select('address')
  authProvider$ = this.select('authProvider')
  network$ = this.select('chainID').pipe(map((chainID) => Networks[chainID]))
  issuer$ = this.select('issuer')
  isBackendAuthorized$: Observable<boolean> = this.select([
    'JWTAccessToken',
    'JWTRefreshToken',
  ]).pipe(map((state) => !!state.JWTAccessToken && !!state.JWTRefreshToken))

  constructor(protected store: PreferenceStore) {
    super(store)
  }

  get network() {
    return Networks[this.getValue().chainID]
  }

  get issuer() {
    return this.getValue().issuer
  }

  get issuerFactories() {
    return Object.values(this.network.tokenizerConfig.issuerFactory).filter(
      (i) => i
    )
  }

  get assetFactories() {
    return Object.values(this.network.tokenizerConfig.assetFactory).filter(
      (i) => i
    )
  }

  get campaignFactories() {
    return Object.values(this.network.tokenizerConfig.cfManagerFactory).filter(
      (i) => i
    )
  }
}
