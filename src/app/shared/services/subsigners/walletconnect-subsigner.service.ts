import {Injectable} from '@angular/core'
import {EMPTY, from, Observable, of, throwError} from 'rxjs'
import {providers} from 'ethers'
import {Networks} from '../../networks'
import {concatMap, map, tap} from 'rxjs/operators'
import {AuthProvider, PreferenceStore} from '../../../preference/state/preference.store'
import {SignerLoginOpts, Subsigner} from '../signer-login-options'
import {switchMapTap} from '../../utils/observables'

@Injectable({
  providedIn: 'root',
})
export class WalletConnectSubsignerService implements Subsigner<WalletConnectLoginOpts> {
  wcProvider: WalletConnectProvider | undefined

  constructor(private preferenceStore: PreferenceStore) {
  }

  private get freshWalletConnectProvider(): Observable<WalletConnectProvider> {
    return from(
      import(
        /* webpackChunkName: "@walletconnect/web3-provider" */
        '@walletconnect/web3-provider')).pipe(
      map((lib) => {
        this.wcProvider = new lib.default({
          chainId: this.preferenceStore.getValue().chainID,
          rpc: Object.fromEntries(Object.entries(Networks)
            .map((entry) => [entry[0], entry[1].rpcURLs[0]]),
          ),
        }) as WalletConnectProvider

        // TODO: using this for debugging purposes. remove after finished with investigation.
        // [
        //   'connect', 'disconnect', 'session_update', 'session_request',
        //   'call_request', 'wc_sessionRequest', 'wc_sessionUpdate',
        // ].forEach(e => {
        //   this.wcProvider?.connector.on(e, (...args: any[]) => {
        //     console.log(e, 'payload', args)
        //   })
        // })
        // getWindow().wcc = this.wcProvider

        return this.wcProvider
      }),
    )
  }

  login(opts: WalletConnectLoginOpts): Observable<providers.JsonRpcSigner> {
    return from(this.freshWalletConnectProvider).pipe(
      switchMapTap(p => from(p.enable())),
      concatMap(p => p.connected && p.accounts.length > 0 ?
        of(p) : throwError(() => 'UNABLE TO CONNECT')),
      tap(p => {
        if (opts.force) {
          this.preferenceStore.update({
            address: p.accounts[0],
            authProvider: AuthProvider.WALLET_CONNECT,
          })
        }
      }),
      map(p => new providers.Web3Provider(p, 'any').getSigner()),
    )
  }

  logout(): Observable<unknown> {
    return from(this.wcProvider ? this.wcProvider.disconnect() : EMPTY)
  }
}

interface WalletConnectLoginOpts extends SignerLoginOpts {
  wallet?: string;
}

interface WalletConnectProvider {
  enable: () => Promise<string[]>;
  connected: boolean;
  accounts: string[];
  connector: any;
  send: (payload: any, callback?: any) => Promise<any>;
  walletMeta: WalletMeta;

  getWalletConnector(opts: { disableSessionCreation?: boolean }): Promise<any>

  disconnect(): Promise<void>;
}

interface WalletMeta {
  name: string
  description: string
  url: string
  icons: string[]
}
