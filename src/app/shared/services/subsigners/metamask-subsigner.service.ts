import {Injectable} from '@angular/core'
import {from, Observable, of, throwError, zip} from 'rxjs'
import {providers} from 'ethers'
import {catchError, concatMap, map, tap} from 'rxjs/operators'
import {MetamaskNetworks} from '../../networks'
import {AuthProvider, PreferenceStore} from '../../../preference/state/preference.store'
import {getWindow} from '../../utils/browser'

@Injectable({
  providedIn: 'root',
})
export class MetamaskSubsignerService implements Subsigner {
  constructor(private preferenceStore: PreferenceStore) {
  }

  login(opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return this.getSigner().pipe(
      concatMap(signer => zip(this.loginGetAddress(signer, opts), this.checkChainID(signer, opts))),
      tap(([address, _signer]) => this.preferenceStore.update({address, authProvider: AuthProvider.METAMASK})),
      map(([_address, signer]) => signer),
    )
  }

  private getSigner(): Observable<providers.JsonRpcSigner> {
    return of(getWindow()?.ethereum).pipe(
      concatMap(web3Provider => web3Provider ?
        of(new providers.Web3Provider(web3Provider, 'any')
          .getSigner()) : throwError('NO_METAMASK')),
    )
  }

  private checkChainID(signer: providers.JsonRpcSigner, opts: SubsignerLoginOpts) {
    return from(signer.getChainId()).pipe(
      concatMap(chainID => chainID === this.preferenceStore.getValue().chainID ?
        of(chainID) : opts.force ? this.switchEthereumChain(signer, opts) :
          throwError('WRONG_NETWORK'),
      ),
      map(() => signer),
    )
  }

  private switchEthereumChain(
    signer: providers.JsonRpcSigner, opts: SubsignerLoginOpts,
  ): Observable<unknown> {
    return from(signer.provider.send('wallet_switchEthereumChain',
      [{chainId: MetamaskNetworks[this.preferenceStore.getValue().chainID].chainId}])).pipe(
      catchError(err => err.code === 4902 ? this.addEthereumChain(signer).pipe(
        concatMap(() => this.checkChainID(signer, opts)),
      ) : throwError('UNHANDLED_SWITCH_CHAIN_ERROR')),
    ).pipe(catchError(() => throwError('CANNOT_SWITCH_CHAIN')))
  }

  private addEthereumChain(signer: providers.JsonRpcSigner) {
    return from(signer.provider.send('wallet_addEthereumChain',
      [MetamaskNetworks[this.preferenceStore.getValue().chainID]])).pipe(
      concatMap(addChainResult => addChainResult === null ?
        of(addChainResult) : throwError('CANNOT_CHANGE_NETWORK')),
    )
  }

  private loginGetAddress(signer: providers.JsonRpcSigner, opts: SubsignerLoginOpts): Observable<string> {
    return from(signer.getAddress()).pipe(
      catchError(() => opts.force ? from(signer.provider.send('eth_requestAccounts', [])).pipe(
        map(addresses => addresses?.[0]),
      ) : throwError('NO_ADDRESS')),
      concatMap(address => !!address ? of(address) : throwError('NO_ADDRESS')),
      concatMap(address => opts.wallet ? (
        opts.wallet === address ? of(address) : throwError('WRONG_ADDRESS')
      ) : of(address)),
    )
  }

  logout(): Observable<unknown> {
    return of(null)
  }
}

export interface Subsigner {
  login(opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner>;

  logout(): Observable<unknown>;
}

export interface SubsignerLoginOpts {
  wallet?: string;
  force?: boolean;
}
