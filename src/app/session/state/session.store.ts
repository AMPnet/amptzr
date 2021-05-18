import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';
import {ethers} from 'ethers';


export interface SessionState {
  address?: string;
  chainID?: number;
  signer?: ethers.providers.JsonRpcSigner;
  provider?: ethers.providers.JsonRpcProvider;
}

export function createInitialState(): SessionState {
  return {};
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'session', resettable: true})
export class SessionStore extends Store<SessionState> {
  constructor() {
    super(createInitialState());
  }
}
