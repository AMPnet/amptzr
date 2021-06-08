import {ChangeDetectorRef, Injectable} from '@angular/core'
import {defer, EMPTY, from, Observable, of, throwError} from 'rxjs'
import {ethers} from 'ethers'
import {catchError, concatMap, map, tap} from 'rxjs/operators'
import {MetamaskNetworks} from '../../networks'
import {PreferenceStore, WalletProvider} from '../../../preference/state/preference.store'
import {ChangeDetection} from '@angular/cli/lib/config/workspace-schema';

@Injectable({
  providedIn: 'root'
})
export class MetamaskSubsignerService implements Subsigner {
  constructor(private preferenceStore: PreferenceStore) {
  }

  login(opts: SubsignerLoginOpts): Observable<ethers.providers.JsonRpcSigner> {
    return of((window as any)?.ethereum).pipe(
      concatMap(web3Provider => web3Provider ?
        of(new ethers.providers.Web3Provider(web3Provider)
          .getSigner()) : throwError('NO_METAMASK')),
      concatMap(signer => from(signer.getChainId()).pipe(
        concatMap(chainID => chainID === this.preferenceStore.getValue().chainID ?
          of(chainID) : from(signer.provider.send('wallet_addEthereumChain',
            [MetamaskNetworks[this.preferenceStore.getValue().chainID]])).pipe(
            concatMap(addChainResult => addChainResult === null ?
              of(addChainResult) : throwError('CANNOT_CHANGE_NETWORK'))
          )),
        map(() => signer),
      )),
      concatMap(signer => this.loginGetAddress(signer, !!opts.force).pipe(
        concatMap(address => opts.wallet ? (
          opts.wallet === address ? of(address) : throwError('WRONG_ADDRESS')
        ) : of(address)),
        tap(address => this.preferenceStore.update({address, providerType: WalletProvider.METAMASK})),
        map(() => signer),
        )
      )
    )
  }

  private loginGetAddress(signer: ethers.providers.JsonRpcSigner, force: boolean): Observable<string> {
    return from(signer.getAddress()).pipe(
      catchError(() => force ? from(signer.provider.send('eth_requestAccounts', [])) : throwError('NO_ADDRESS')),
      concatMap(address => !!address ? of(address) : throwError('NO_ADDRESS')),
    )
  }

  logout(): Observable<unknown> {
    return of(EMPTY)
  }
}

export interface Subsigner {
  login(opts: SubsignerLoginOpts): Observable<ethers.providers.JsonRpcSigner>;

  logout(): Observable<unknown>;
}

export interface SubsignerLoginOpts {
  wallet?: string;
  force?: boolean;
}
