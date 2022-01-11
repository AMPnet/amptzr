import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of, throwError, zip} from 'rxjs'
import {providers} from 'ethers'
import {catchError, concatMap, map, switchMap, tap} from 'rxjs/operators'
import {MetamaskNetworks} from '../../networks'
import {AuthProvider, PreferenceStore} from '../../../preference/state/preference.store'
import {getWindow} from '../../utils/browser'
import {ERC20__factory} from '../../../../../types/ethers-contracts'

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
          .getSigner()) : throwError(() => 'NO_METAMASK')),
    )
  }

  private checkChainID(signer: providers.JsonRpcSigner, opts: SubsignerLoginOpts) {
    return from(signer.getChainId()).pipe(
      concatMap(chainID => chainID === this.preferenceStore.getValue().chainID ?
        of(chainID) : opts.force ? this.switchEthereumChain(signer, opts) :
          throwError(() => 'WRONG_NETWORK'),
      ),
      map(() => signer),
    )
  }

  private switchEthereumChain(
    signer: providers.JsonRpcSigner, opts: SubsignerLoginOpts,
  ): Observable<unknown> {
    return from(signer.provider.send('wallet_switchEthereumChain',
      [{chainId: MetamaskNetworks[this.preferenceStore.getValue().chainID].chainId}])).pipe(
      // TODO: wait for issue fix: https://github.com/MetaMask/metamask-mobile/issues/3312
      // catchError(err => err.code === 4902 ? this.addEthereumChain(signer).pipe(
      //   concatMap(() => this.checkChainID(signer, opts)),
      // ) : throwError(() => 'UNHANDLED_SWITCH_CHAIN_ERROR')),
      catchError(() => this.addEthereumChain(signer).pipe(
        concatMap(() => this.checkChainID(signer, opts)),
      )),
    ).pipe(catchError(() => throwError(() => 'CANNOT_SWITCH_CHAIN')))
  }

  private addEthereumChain(signer: providers.JsonRpcSigner) {
    return from(signer.provider.send('wallet_addEthereumChain',
      [MetamaskNetworks[this.preferenceStore.getValue().chainID]])).pipe(
      concatMap(addChainResult => addChainResult === null ?
        of(addChainResult) : throwError(() => 'CANNOT_CHANGE_NETWORK')),
    )
  }

  watchAsset(signer: providers.JsonRpcSigner, assetAddress: string): Observable<boolean> {
    return of(ERC20__factory.connect(assetAddress, signer)).pipe(
      switchMap(contract => of(contract).pipe(
        switchMap(contract => combineLatest([contract.decimals(), contract.symbol()])),
        map(([decimals, symbol]) => ({
          type: 'ERC20',
          options: {
            address: assetAddress,
            decimals,
            symbol,
          },
        } as WatchAssetParams)),
        switchMap(params => signer.provider.send('wallet_watchAsset', params as any)),
      )),
    )
  }

  private loginGetAddress(signer: providers.JsonRpcSigner, opts: SubsignerLoginOpts): Observable<string> {
    return from(signer.getAddress()).pipe(
      catchError(() => opts.force ? from(signer.provider.send('eth_requestAccounts', [])).pipe(
        map(addresses => addresses?.[0]),
      ) : throwError(() => 'NO_ADDRESS')),
      concatMap(address => !!address ? of(address) : throwError(() => 'NO_ADDRESS')),
      concatMap(address => opts.wallet ? (
        opts.wallet === address ? of(address) : throwError(() => 'WRONG_ADDRESS')
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
  email?: string;
  wallet?: string;
  force?: boolean;
}

interface WatchAssetParams {
  type: 'ERC20'; // In the future, other standards will be supported
  options: {
    address: string; // The address of the token contract
    'symbol': string; // A ticker symbol or shorthand, up to 5 characters
    decimals: number; // The number of token decimals
    image: string; // A string url of the token logo
  };
}
