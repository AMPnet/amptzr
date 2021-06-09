import {Injectable} from '@angular/core'
import {from, Observable, of, throwError} from 'rxjs'
import {concatMap, map, tap} from 'rxjs/operators'
import {providers} from 'ethers'
import {Subsigner, SubsignerLoginOpts} from './metamask-subsigner.service'
import {ArkaneConnect} from '@arkane-network/arkane-connect/dist/src/connect/connect'
import {PreferenceStore, WalletProvider} from '../../../preference/state/preference.store'
import {VenlyNetworks} from '../../networks'
import {AuthenticationResult} from '@arkane-network/arkane-connect/dist/src/connect/connect'

@Injectable({
  providedIn: 'root'
})
export class VenlySubsignerService implements Subsigner {
  arkaneConnect!: ArkaneConnect;

  constructor(private preferenceStore: PreferenceStore) {
  }

  login(opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return from(import(
      /* webpackChunkName: "@arkane-network/web3-arkane-provider" */
      '@arkane-network/web3-arkane-provider')).pipe(
      concatMap(lib => lib.Arkane.createArkaneProviderEngine({
        clientId: 'AMPnet',
        skipAuthentication: !opts.force,
        environment: 'staging',
        secretType: VenlyNetworks[this.preferenceStore.getValue().chainID],
      })),
      tap(() => this.arkaneConnect = (window as any).Arkane.arkaneConnect()),
      map(p => new providers.Web3Provider(p as any).getSigner()),
      // TODO: when issue with checkAuthenticated() is fixed in the next release, change to:
      // from(this.arkaneConnect.checkAuthenticated())
      concatMap(signer => from((window as any).Arkane.checkAuthenticated() as Observable<AuthenticationResult>).pipe(
        concatMap(authRes => authRes.isAuthenticated ? of(authRes) :
          opts.force ? from(this.arkaneConnect.flows.authenticate()) : throwError('NO_ADDRESS')),
        concatMap(() => of(signer))
      )),
      concatMap(signer => from(signer.getAddress()).pipe(
        tap(address => this.preferenceStore.update({
          address: address,
          providerType: WalletProvider.ARKANE
        })),
        map(() => signer)
      ))
    )
  }

  logout(): Observable<unknown> {
    return of(this.arkaneConnect).pipe(
      tap(arkaneConnect => arkaneConnect.logout())
    )
  }
}
