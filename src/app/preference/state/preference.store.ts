import {Injectable} from '@angular/core'
import {Store, StoreConfig} from '@datorama/akita'
import {ChainID, MaticNetwork, Networks} from '../../shared/networks'
import {environment} from '../../../environments/environment'

export interface PreferenceState {
  address: string;
  authProvider: AuthProvider | '';
  JWTAccessToken: string;
  JWTRefreshToken: string;
  chainID: ChainID;
  issuer: {
    address: string,
    createdByAddress?: string
    slug?: string
  }
}

export function createInitialState(): PreferenceState {
  return {
    address: '',
    authProvider: '',
    JWTAccessToken: '',
    JWTRefreshToken: '',
    chainID: Networks[<ChainID>Number(environment.fixed.chainID)]?.chainID || MaticNetwork.chainID,
    issuer: {
      address: environment.fixed.issuer || MaticNetwork.tokenizerConfig.defaultIssuer,
    },
  }
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'preference'})
export class PreferenceStore extends Store<PreferenceState> {
  constructor() {
    super(createInitialState())
  }
}

export enum AuthProvider {
  METAMASK = 'METAMASK',
  WALLET_CONNECT = 'WALLET_CONNECT',
  VENLY = 'VENLY',
}
