import {Injectable} from '@angular/core'
import {Store, StoreConfig} from '@datorama/akita'
import {ChainID, MumbaiNetwork} from '../../shared/networks'

export interface PreferenceState {
  address: string;
  providerType: WalletProvider | '';
  chainID: ChainID;
}

export function createInitialState(): PreferenceState {
  return {
    address: '',
    providerType: '',
    chainID: MumbaiNetwork.chainID,
  }
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'preference'})
export class PreferenceStore extends Store<PreferenceState> {
  constructor() {
    super(createInitialState())
  }
}

export enum WalletProvider {
  METAMASK = 'METAMASK',
  WALLET_CONNECT = 'WALLET_CONNECT',
  ARKANE = 'ARKANE',
}
