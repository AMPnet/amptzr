import {Injectable} from '@angular/core'
import {from, Observable, of, throwError} from 'rxjs'
import {concatMap, map, tap} from 'rxjs/operators'
import {ethers} from 'ethers'
import {Subsigner, SubsignerLoginOpts} from './metamask-subsigner.service'
import {ArkaneConnect, SecretType} from '@arkane-network/arkane-connect'
import {PreferenceStore, WalletProvider} from '../../../preference/state/preference.store'

@Injectable({
  providedIn: 'root'
})
export class VenlySubsignerService implements Subsigner {
  arkaneConnect!: ArkaneConnect;

  constructor(private preferenceStore: PreferenceStore) {
  }

  login(opts: SubsignerLoginOpts): Observable<ethers.providers.JsonRpcSigner> {
    return from(import(
      /* webpackChunkName: "@arkane-network/web3-arkane-provider" */
      '@arkane-network/web3-arkane-provider')).pipe(
      concatMap(lib => lib.Arkane.createArkaneProviderEngine({
        clientId: 'AMPnet',
        skipAuthentication: true,
        environment: 'qa',
        secretType: SecretType.MATIC,
      })),
      tap(() => this.arkaneConnect = (window as any).Arkane.arkaneConnect()),
      map(p => new ethers.providers.Web3Provider(p as any).getSigner()),
      concatMap(signer => from(this.arkaneConnect.checkAuthenticated()).pipe(
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
