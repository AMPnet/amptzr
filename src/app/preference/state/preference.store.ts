import {Injectable} from '@angular/core'
import {Store, StoreConfig} from '@datorama/akita'
import {ChainID, MumbaiNetwork} from '../../shared/networks'

export interface PreferenceState {
  address: string;
  authProvider: AuthProvider | '';
  chainID: ChainID;
  JWTAccessToken?: string;
  JWTRefreshToken?: string;
}

export function createInitialState(): PreferenceState {
  return {
    address: '',
    authProvider: '',
    chainID: MumbaiNetwork.chainID,
    JWTAccessToken: '',
    JWTRefreshToken: '',
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
