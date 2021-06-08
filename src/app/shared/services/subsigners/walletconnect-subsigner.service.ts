import {Injectable} from '@angular/core'
import {Subsigner, SubsignerLoginOpts} from './metamask-subsigner.service'
import {EMPTY, from, Observable, of, race, Subject} from 'rxjs'
import {ethers} from 'ethers'
import {ChainID, MaticNetwork, MumbaiNetwork} from '../../networks'
import {catchError, concatMap, map, take, tap} from 'rxjs/operators'
import {PreferenceStore, WalletProvider} from '../../../preference/state/preference.store'

@Injectable({
  providedIn: 'root'
})
export class WalletConnectSubsignerService implements Subsigner {
  walletConnectProvider: WalletConnectProvider | undefined
  disconnect$ = new Subject<void>()

  constructor(private preferenceStore: PreferenceStore) {
  }

  login(opts: SubsignerLoginOpts): Observable<ethers.providers.JsonRpcSigner> {
    return from(this.freshWalletConnectProvider).pipe(
      concatMap(p => p.connected && p.accounts.length > 0 ?
        of(p) : this.connect(p)),
      map(p => new ethers.providers.Web3Provider(p).getSigner()),
    )
  }

  logout(): Observable<unknown> {
    return from(this.walletConnectProvider ? this.walletConnectProvider.disconnect() : EMPTY)
  }

  private connect(p: WalletConnectProvider): Observable<WalletConnectProvider> {
    return race(from(p.enable()), this.disconnect$.pipe(take(1), concatMap(() => EMPTY))).pipe(
      catchError(() => EMPTY),
      tap(addresses => this.preferenceStore.update({
        address: addresses[0],
        providerType: WalletProvider.WALLET_CONNECT
      })),
      map(() => p)
    )
  }

  private get freshWalletConnectProvider(): Observable<WalletConnectProvider> {
    return from(
      import(
        /* webpackChunkName: "@walletconnect/web3-provider" */
        '@walletconnect/web3-provider')).pipe(
      map((lib) => {
        this.walletConnectProvider = new lib.default({
          chainId: this.preferenceStore.getValue().chainID,
          rpc: {
            [ChainID.MATIC_MAINNET]: MaticNetwork.rpcURLs[0],
            [ChainID.MUMBAI_TESTNET]: MumbaiNetwork.rpcURLs[0],
          },
        }) as WalletConnectProvider

        this.walletConnectProvider.connector.on('disconnect', () => this.disconnect$.next())

        return this.walletConnectProvider
      })
    )
  }
}

interface WalletConnectProvider extends IWalletConnectProviderOptions {
  enable: () => Promise<string[]>;
  connected: boolean;
  accounts: string[];
  connector: IConnector;
  send: (payload: any, callback?: any) => Promise<any>;

  disconnect(): Promise<void>;
}


//
// Types below are copied from `@walletconnect/types@1.4.1` as we
// are unable to import them with webpack v5
//
// URL: https://github.com/WalletConnect/walletconnect-monorepo/blob/1.4.1/packages/helpers/types/index.d.ts
//

export interface IConnector {
  bridge: string;
  key: string;
  clientId: string;
  peerId: string;
  readonly clientMeta: IClientMeta | null;
  peerMeta: IClientMeta | null;
  handshakeTopic: string;
  handshakeId: number;
  uri: string;
  chainId: number;
  networkId: number;
  accounts: string[];
  rpcUrl: string;
  readonly connected: boolean;
  readonly pending: boolean;
  session: IWalletConnectSession;

  on(event: string, callback: (error: Error | null, payload: any | null) => void): void;

  connect(opts?: ICreateSessionOptions): Promise<ISessionStatus>;

  createSession(opts?: ICreateSessionOptions): Promise<void>;

  approveSession(sessionStatus: ISessionStatus): void;

  rejectSession(sessionError?: ISessionError): void;

  updateSession(sessionStatus: ISessionStatus): void;

  killSession(sessionError?: ISessionError): Promise<void>;

  sendTransaction(tx: ITxData): Promise<any>;

  signTransaction(tx: ITxData): Promise<any>;

  signMessage(params: any[]): Promise<any>;

  signPersonalMessage(params: any[]): Promise<any>;

  signTypedData(params: any[]): Promise<any>;

  updateChain(chainParams: IUpdateChainParams): Promise<any>;

  sendCustomRequest(request: Partial<IJsonRpcRequest>, options?: IRequestOptions): Promise<any>;

  unsafeSend(
    request: IJsonRpcRequest,
    options?: IRequestOptions,
  ): Promise<IJsonRpcResponseSuccess | IJsonRpcResponseError>;

  approveRequest(response: Partial<IJsonRpcResponseSuccess>): void;

  rejectRequest(response: Partial<IJsonRpcResponseError>): void;
}

export interface ICryptoLib {
  generateKey: (length?: number) => Promise<ArrayBuffer>;
  encrypt: (
    data: IJsonRpcRequest | IJsonRpcResponseSuccess | IJsonRpcResponseError,
    key: ArrayBuffer,
    iv?: ArrayBuffer,
  ) => Promise<IEncryptionPayload>;
  decrypt: (
    payload: IEncryptionPayload,
    key: ArrayBuffer,
  ) => Promise<IJsonRpcRequest | IJsonRpcResponseSuccess | IJsonRpcResponseError | null>;
}

export interface ITransportLib {
  open: () => void;
  close: () => void;
  send: (message: string, topic?: string, silent?: boolean) => void;
  subscribe: (topic: string) => void;
  on: (event: string, callback: (payload: any) => void) => void;
}

export interface ITransportEvent {
  event: string;
  callback: (payload: any) => void;
}

export type NetworkEvent = "online" | "offline";

export interface INetworkMonitor {
  on: (event: NetworkEvent, callback: () => void) => void;
}

export interface INetworkEventEmitter {
  event: NetworkEvent;
  callback: () => void;
}

export interface ISessionStorage {
  getSession: () => IWalletConnectSession | null;
  setSession: (session: IWalletConnectSession) => IWalletConnectSession;
  removeSession: () => void;
}

export interface IEncryptionPayload {
  data: string;
  hmac: string;
  iv: string;
}

export interface ISocketMessage {
  topic: string;
  type: string;
  payload: string;
  silent: boolean;
}

export interface ISocketTransportOptions {
  protocol: string;
  version: number;
  url: string;
  netMonitor?: INetworkMonitor;
  subscriptions?: string[];
}

export interface ISessionStatus {
  chainId: number;
  accounts: string[];
  networkId?: number;
  rpcUrl?: string;
}

export interface ISessionError {
  message?: string;
}

export interface IInternalEvent {
  event: string;
  params: any;
}

export interface ICallTxData {
  to?: string;
  value?: number | string;
  gas?: number | string;
  gasLimit?: number | string;
  gasPrice?: number | string;
  nonce?: number | string;
  data?: string;
}

export interface ITxData extends ICallTxData {
  from: string;
}

export interface IJsonRpcResponseSuccess {
  id: number;
  jsonrpc: string;
  result: any;
}

export interface IJsonRpcErrorMessage {
  code?: number;
  message: string;
}

export interface IJsonRpcResponseError {
  id: number;
  jsonrpc: string;
  error: IJsonRpcErrorMessage;
}

export interface IJsonRpcRequest {
  id: number;
  jsonrpc: string;
  method: string;
  params: any[];
}

export interface IJsonRpcSubscription {
  id: number;
  jsonrpc: string;
  method: string;
  params: any;
}

export type JsonRpc =
  | IJsonRpcRequest
  | IJsonRpcSubscription
  | IJsonRpcResponseSuccess
  | IJsonRpcResponseError;

export type IErrorCallback = (err: Error | null, data?: any) => void;

export type ICallback = () => void;

export interface IError extends Error {
  res?: any;
  code?: any;
}

export interface IClientMeta {
  description: string;
  url: string;
  icons: string[];
  name: string;
}

export interface IEventEmitter {
  event: string;
  callback: (error: Error | null, request: any | null) => void;
}

export interface IRequiredParamsResult {
  handshakeTopic: string;
  version: number;
}

export interface IQueryParamsResult {
  bridge: string;
  key: string;
}

export interface IParseURIResult {
  protocol: string;
  handshakeTopic: string;
  version: number;
  bridge: string;
  key: string;
}

export interface ISessionParams {
  approved: boolean;
  chainId: number | null;
  networkId: number | null;
  accounts: string[] | null;
  rpcUrl?: string | null;
  peerId?: string | null;
  peerMeta?: IClientMeta | null;
}

export interface IWalletConnectSession {
  connected: boolean;
  accounts: string[];
  chainId: number;
  bridge: string;
  key: string;
  clientId: string;
  clientMeta: IClientMeta | null;
  peerId: string;
  peerMeta: IClientMeta | null;
  handshakeId: number;
  handshakeTopic: string;
}

export interface IWalletConnectOptions {
  bridge?: string;
  uri?: string;
  session?: IWalletConnectSession;
  storage?: ISessionStorage;
  clientMeta?: IClientMeta;
  qrcodeModal?: IQRCodeModal;
  qrcodeModalOptions?: IQRCodeModalOptions;
}

export interface IConnectorOpts {
  cryptoLib: ICryptoLib;
  connectorOpts: IWalletConnectOptions;
  transport?: ITransportLib;
  sessionStorage?: ISessionStorage;
  pushServerOpts?: IPushServerOptions;
}

export interface INodeJSOptions {
  clientMeta: IClientMeta;
}

export interface IPushServerOptions {
  url: string;
  type: string;
  token: string;
  peerMeta?: boolean;
  language?: string;
}

export interface INativeWalletOptions {
  clientMeta: IClientMeta;
  push?: IPushServerOptions | null;
}

export interface IPushSubscription {
  bridge: string;
  topic: string;
  type: string;
  token: string;
  peerName: string;
  language: string;
}

export interface IUpdateChainParams {
  chainId: number;
  networkId: number;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
  };
}

export interface IRPCMap {
  [chainId: number]: string;
}

export interface IWCRpcConnectionOptions {
  connector?: IConnector;
  bridge?: string;
  qrcode?: boolean;
  chainId?: number;
  qrcodeModalOptions?: IQRCodeModalOptions;
  clientMeta?: IClientMeta;
}

export interface IWCEthRpcConnectionOptions extends IWCRpcConnectionOptions {
  rpc?: IRPCMap;
  infuraId?: string;
}

export interface IWalletConnectStarkwareProviderOptions extends IWCRpcConnectionOptions {
  contractAddress: string;
}

export interface IWalletConnectSDKOptions extends IWalletConnectOptions {
  bridge?: string;
}

export interface IWalletConnectProviderOptions extends IWCEthRpcConnectionOptions {
  pollingInterval?: number;
  qrcodeModal?: IQRCodeModal;
}

export interface IRequestOptions {
  forcePushNotification?: boolean;
}

export interface IInternalRequestOptions extends IRequestOptions {
  topic: string;
}

export interface ICreateSessionOptions {
  chainId?: number;
}

export abstract class IEvents {
  public abstract on(event: string, listener: any): void;

  public abstract once(event: string, listener: any): void;

  public abstract off(event: string, listener: any): void;

  public abstract removeListener(event: string, listener: any): void;
}

export interface IRpcConnection extends IEvents {
  connected: boolean;

  send(payload: any): Promise<any>;

  open(): Promise<void>;

  close(): Promise<void>;
}

export interface IWCRpcConnection extends IRpcConnection {
  bridge: string;
  qrcode: boolean;
  wc: IConnector | null;
  connected: boolean;

  create(chainId?: number): void;

  onClose(): void;

  onError(payload: any, message: string, code?: number): void;

  sendPayload(payload: any): Promise<IJsonRpcResponseSuccess | IJsonRpcResponseError>;
}

export interface IQRCodeModal {
  open(uri: string, cb: any, opts?: any): void;

  close(): void;
}

export interface IQRCodeModalOptions {
  mobileLinks?: string[];
}

export interface IMobileRegistryEntry {
  name: string;
  shortName: string;
  color: string;
  logo: string;
  universalLink: string;
  deepLink: string;
}

export type IMobileRegistry = IMobileRegistryEntry[];

export interface IMobileLinkInfo {
  name: string;
  href: string;
}

export interface IAppEntry {
  id: string;
  name: string;
  homepage: string;
  chains: string[];
  app: {
    browser: string;
    ios: string;
    android: string;
    mac: string;
    windows: string;
    linux: string;
  };
  mobile: {
    native: string;
    universal: string;
  };
  desktop: {
    native: string;
    universal: string;
  };
  metadata: {
    shortName: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

export type IAppRegistry = {
  [id: string]: IAppEntry;
};
