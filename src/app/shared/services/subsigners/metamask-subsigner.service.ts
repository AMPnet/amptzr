import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of, throwError} from 'rxjs'
import {providers, utils} from 'ethers'
import {catchError, concatMap, map, switchMap, tap} from 'rxjs/operators'
import {Network, Networks} from '../../networks'
import {AuthProvider, PreferenceStore} from '../../../preference/state/preference.store'
import {getWindow} from '../../utils/browser'
import {ERC20__factory} from '../../../../../types/ethers-contracts'
import {SignerLoginOpts, Subsigner} from '../signer-login-options'

@Injectable({
  providedIn: 'root',
})
export class MetamaskSubsignerService implements Subsigner<MetamaskLoginOpts> {
  subprovider!: providers.Web3Provider

  constructor(private preferenceStore: PreferenceStore) {
  }

  login(opts: MetamaskLoginOpts): Observable<providers.JsonRpcSigner> {
    return this.registerMetamask().pipe(
      switchMap(() => this.loginGetAddress(opts).pipe(
        switchMap(address => this.checkChainID(opts).pipe(
          tap(() => this.preferenceStore.update({
            address, authProvider: AuthProvider.METAMASK,
          })),
        )),
      )),
      map(() => this.subprovider.getSigner()),
    )
  }

  watchAsset(assetAddress: string): Observable<boolean> {
    return of(ERC20__factory.connect(assetAddress, this.subprovider.getSigner())).pipe(
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
        switchMap(params => this.subprovider.getSigner().provider.send('wallet_watchAsset', params as any)),
      )),
    )
  }

  logout(): Observable<unknown> {
    return of(null)
  }

  switchEthereumChain(opts: MetamaskLoginOpts = {}): Observable<unknown> {
    return from(this.subprovider.getSigner().provider.send('wallet_switchEthereumChain',
      [{chainId: MetamaskNetworks[this.preferenceStore.getValue().chainID].chainId}])).pipe(
      catchError(err => {
        switch (err.code) {
          case 4001:
            return throwError(() => 'USER_DISMISSED_POPUP')
          // TODO: wait for issue fix: https://github.com/MetaMask/metamask-mobile/issues/3312
          // case 4902:
          //   return this.addEthereumChain().pipe(
          //     concatMap(() => this.checkChainID(opts)),
          //   )
          // default:
          //   return throwError(() => 'UNHANDLED_SWITCH_CHAIN_ERROR')
          default:
            return this.addEthereumChain().pipe(
              concatMap(() => this.checkChainID(opts)),
            )
        }
      }),
    ).pipe(catchError(() => throwError(() => 'CANNOT_SWITCH_CHAIN')))
  }

  private registerMetamask(): Observable<providers.JsonRpcSigner> {
    return of(getWindow()?.ethereum).pipe(
      concatMap(web3Provider => web3Provider ?
        of(new providers.Web3Provider(web3Provider, 'any')).pipe(
          map(subprovider => {
            this.subprovider = subprovider
            return this.subprovider.getSigner()
          }),
        ) : throwError(() => 'NO_METAMASK')),
    )
  }

  private checkChainID(opts: MetamaskLoginOpts) {
    return from(this.subprovider.getSigner().getChainId()).pipe(
      concatMap(chainID => chainID === this.preferenceStore.getValue().chainID ?
        of(chainID) : opts.force ? this.switchEthereumChain(opts) : of(undefined),
      ),
    )
  }

  private addEthereumChain() {
    return from(this.subprovider.getSigner().provider.send('wallet_addEthereumChain',
      [MetamaskNetworks[this.preferenceStore.getValue().chainID]])).pipe(
      concatMap(addChainResult => addChainResult === null ?
        of(addChainResult) : throwError(() => 'CANNOT_CHANGE_NETWORK')),
    )
  }

  private loginGetAddress(opts: MetamaskLoginOpts): Observable<string> {
    return from(this.subprovider.getSigner().getAddress()).pipe(
      catchError(() => opts.force ? this.ethRequestAccounts().pipe(
        map(addresses => addresses?.[0]),
      ) : throwError(() => 'NO_ADDRESS')),
      concatMap(address => !!address ? of(address) : throwError(() => 'NO_ADDRESS')),
      concatMap(address => opts.wallet ? (
        opts.wallet === address ? of(address) : throwError(() => 'WRONG_ADDRESS')
      ) : of(address)),
    )
  }

  private ethRequestAccounts() {
    return from(this.subprovider.getSigner().provider.send('eth_requestAccounts', []))
  }
}

interface MetamaskLoginOpts extends SignerLoginOpts {
  wallet?: string;
}

/**
 * Interface from wallet_watchAsset request parameters.
 * Source: https://docs.metamask.io/guide/rpc-api.html#wallet-watchasset
 * Last date accessed: 20211227
 */
interface WatchAssetParams {
  type: 'ERC20'; // In the future, other standards will be supported
  options: {
    address: string; // The address of the token contract
    symbol: string; // A ticker symbol or shorthand, up to 5 characters
    decimals: number; // The number of token decimals
    image: string; // A string url of the token logo
  };
}

/**
 * Interface from wallet_addEthereumChain response.
 * Source: https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
 * Last date accessed: 20211227
 */
interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

const getMetamaskNetwork = (network: Network): AddEthereumChainParameter => ({
  chainId: utils.hexValue(network.chainID),
  chainName: network.name,
  nativeCurrency: {
    name: network.nativeCurrency.name,
    symbol: network.nativeCurrency.symbol,
    decimals: 18,
  },
  rpcUrls: network.rpcURLs,
  blockExplorerUrls: network.explorerURLs,
})

export const MetamaskNetworks = Object.fromEntries(Object.entries(Networks)
  .map((entry) => [entry[0], getMetamaskNetwork(entry[1])]),
)
