import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';


export interface SessionState {
  address: string;
  providerType: WalletProvider | '';
}

export function createInitialState(): SessionState {
  return {
    address: '',
    providerType: '',
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
