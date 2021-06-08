import {Injectable} from '@angular/core'
import {EMPTY, from, Observable} from 'rxjs'
import {concatMap, map, tap} from 'rxjs/operators'
import {ethers} from 'ethers'
import {Subsigner, SubsignerLoginOpts} from './metamask-subsigner.service'
import {SecretType} from '@arkane-network/arkane-connect'
import {PreferenceStore, WalletProvider} from '../../../preference/state/preference.store'

@Injectable({
  providedIn: 'root'
})
export class VenlySubsignerService implements Subsigner {

  constructor(private preferenceStore: PreferenceStore) {
  }

  login(opts: SubsignerLoginOpts): Observable<ethers.providers.JsonRpcSigner> {
    return from(import(
      /* webpackChunkName: "@arkane-network/web3-arkane-provider" */
      '@arkane-network/web3-arkane-provider')).pipe(
      concatMap(a => a.Arkane.createArkaneProviderEngine({
        clientId: 'AMPnet',
        skipAuthentication: false,
        environment: 'staging',
        secretType: SecretType.MATIC
      })),
      map(p => new ethers.providers.Web3Provider(p as any).getSigner()),
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
    return EMPTY
  }
}
