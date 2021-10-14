import {Injectable} from '@angular/core'
import {Subsigner, SubsignerLoginOpts} from './metamask-subsigner.service'
import {from, Observable, of} from 'rxjs'
import {providers} from 'ethers'
import {concatMap, map, switchMap, tap} from 'rxjs/operators'
import {AuthProvider, PreferenceStore} from '../../../preference/state/preference.store'
import {WidgetMode} from 'fortmatic/dist/cjs/src/core/sdk'
import {PreferenceQuery} from '../../../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class FortmaticSubsignerService implements Subsigner {
  subprovider: FortmaticProvider | undefined

  constructor(private preferenceStore: PreferenceStore,
              private preferenceQuery: PreferenceQuery) {
  }

  login(opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return this.registerFortmatic.pipe( // TODO: check if logged in (passive login)
      map(p => new providers.Web3Provider(p as any).getSigner()),
      concatMap(signer => this.setAddress(signer)),
    )
  }

  logout(): Observable<unknown> {
    return of(this.subprovider?.user).pipe(
      switchMap(user => user ? user.logout() : of(null)),
    )
  }

  private setAddress(signer: providers.JsonRpcSigner) {
    return from(signer.getAddress()).pipe(
      tap(address => this.preferenceStore.update({
        address: address,
        authProvider: AuthProvider.FORTMATIC,
      })),
      map(() => signer),
    )
  }

  private get registerFortmatic() {
    return from(
      import(
        /* webpackChunkName: "fortmatic" */
        'fortmatic')).pipe(
      map((lib) => {
        return new lib.default('pk_test_DFE40C53ECFC6F36', { // TODO: extract key to env variable
          chainId: this.preferenceQuery.network.chainID,
          rpcUrl: this.preferenceQuery.network.rpcURLs[0],
        })
      }),
      tap(subprovider => this.subprovider = subprovider),
      map(subprovider => subprovider.getProvider()),
    )
  }
}

type FortmaticProvider = WidgetMode
