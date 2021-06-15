import {Injectable} from '@angular/core'
import {from, Observable, of, throwError} from 'rxjs'
import {concatMap, map, tap} from 'rxjs/operators'
import {providers} from 'ethers'
import {Subsigner, SubsignerLoginOpts} from './metamask-subsigner.service'
import {ArkaneConnect, AuthenticationResult} from '@arkane-network/arkane-connect/dist/src/connect/connect'
import {AuthProvider, PreferenceStore} from '../../../preference/state/preference.store'
import {VenlyNetworks} from '../../networks'

@Injectable({
  providedIn: 'root'
})
export class VenlySubsignerService implements Subsigner {
  subprovider!: ArkaneSubprovider;

  constructor(private preferenceStore: PreferenceStore) {
  }

  login(opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return this.registerArkane().pipe(
      map(p => new providers.Web3Provider(p as any).getSigner()),
      concatMap(signer => this.checkAuthenticated(signer, opts)),
      concatMap(signer => this.setAddress(signer))
    )
  }

  private registerArkane() {
    return from(import(
      /* webpackChunkName: "@arkane-network/web3-arkane-provider" */
      '@arkane-network/web3-arkane-provider')).pipe(
      concatMap(lib => lib.Arkane.createArkaneProviderEngine({
        clientId: 'AMPnet',
        skipAuthentication: true,
        environment: 'staging',
        secretType: VenlyNetworks[this.preferenceStore.getValue().chainID],
      })),
      tap(() => this.subprovider = (window as any).Arkane),
    )
  }

  private checkAuthenticated(signer: providers.JsonRpcSigner,
                             opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return of(opts.force).pipe(
      concatMap(force => force ?
        from(this.subprovider.authenticate()) :
        from(this.subprovider.checkAuthenticated())),
      tap(authRes => console.log('TESTGHPAGES authRes', authRes)),
      concatMap(authRes => authRes.isAuthenticated ? of(authRes) : throwError('NO_ADDRESS')),
      concatMap(() => of(signer))
    )
  }

  private setAddress(signer: providers.JsonRpcSigner) {
    return from(signer.getAddress()).pipe(
      tap(address => this.preferenceStore.update({
        address: address,
        authProvider: AuthProvider.VENLY
      })),
      map(() => signer)
    )
  }

  logout(): Observable<unknown> {
    return of(this.subprovider.arkaneConnect()).pipe(
      tap(arkaneConnect => arkaneConnect.logout())
    )
  }

  manageWallets() {
    return of(this.subprovider.arkaneConnect()).pipe(
      concatMap(arkaneConnect => arkaneConnect.manageWallets(VenlyNetworks[this.preferenceStore.getValue().chainID])),
    )
  }
}

interface ArkaneSubprovider {
  arkaneConnect(): ArkaneConnect

  checkAuthenticated(): Promise<AuthenticationResult>

  authenticate(): Promise<AuthenticationResult>
}
