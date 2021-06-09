import {Injectable} from '@angular/core'
import {from, Observable, of, throwError} from 'rxjs'
import {providers} from 'ethers'
import {catchError, concatMap, map, tap} from 'rxjs/operators'
import {MetamaskNetworks} from '../../networks'
import {PreferenceStore, WalletProvider} from '../../../preference/state/preference.store'

@Injectable({
  providedIn: 'root'
})
export class MetamaskSubsignerService implements Subsigner {
  constructor(private preferenceStore: PreferenceStore) {
  }

  login(opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return this.getSigner().pipe(
      concatMap(signer => this.checkChainID(signer, opts)),
      concatMap(signer => this.loginGetAddress(signer, opts).pipe(
        tap(address => this.preferenceStore.update({address, providerType: WalletProvider.METAMASK})),
        map(() => signer)
      ))
    )
  }

  private getSigner(): Observable<providers.JsonRpcSigner> {
    return of((window as any)?.ethereum).pipe(
      concatMap(web3Provider => web3Provider ?
        of(new providers.Web3Provider(web3Provider)
          .getSigner()) : throwError('NO_METAMASK'))
    )
  }

  private checkChainID(signer: providers.JsonRpcSigner, opts: SubsignerLoginOpts) {
    return from(signer.getChainId()).pipe(
      concatMap(chainID => chainID === this.preferenceStore.getValue().chainID ?
        of(chainID) : !opts.force ? throwError('WRONG_NETWORK') :
          from(signer.provider.send('wallet_addEthereumChain',
            [MetamaskNetworks[this.preferenceStore.getValue().chainID]])).pipe(
            concatMap(addChainResult => addChainResult === null ?
              of(addChainResult) : throwError('CANNOT_CHANGE_NETWORK'))
          )),
      map(() => signer),
    )
  }

  private loginGetAddress(signer: providers.JsonRpcSigner, opts: SubsignerLoginOpts): Observable<string> {
    return from(signer.getAddress()).pipe(
      catchError(() => opts.force ? from(signer.provider.send('eth_requestAccounts', [])) : throwError('NO_ADDRESS')),
      concatMap(address => !!address ? of(address) : throwError('NO_ADDRESS')),
      concatMap(address => opts.wallet ? (
        opts.wallet === address ? of(address) : throwError('WRONG_ADDRESS')
      ) : of(address)),
    )
  }

  logout(): Observable<unknown> {
    return of(null)
  }

  isAvailable = (): boolean => !!(window as any)?.ethereum
}

export interface Subsigner {
  login(opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner>;

  logout(): Observable<unknown>;
}

export interface SubsignerLoginOpts {
  wallet?: string;
  force?: boolean;
}
