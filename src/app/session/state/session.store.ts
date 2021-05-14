import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';
import {ethers} from 'ethers';


export interface SessionState {
  address: string;
  providerType: WalletProvider | '';
  provider?: ethers.providers.Web3Provider;
}

export function createInitialState(): SessionState {
  return {
    address: '',
    providerType: '',
    provider: undefined
  };
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'session'})
export class SessionStore extends Store<SessionState> {
  constructor() {
    super(createInitialState());
  }
}

export enum WalletProvider {
  METAMASK = 'METAMASK',
  ARKANE = 'ARKANE',
}
