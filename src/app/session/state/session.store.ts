import {Injectable} from '@angular/core'
import {Store, StoreConfig} from '@datorama/akita'
import {ethers} from 'ethers'

export interface SessionState {
  address?: string;
  signer?: ethers.providers.JsonRpcSigner;
  provider?: ethers.providers.Provider;
}

export function createInitialState(): SessionState {
  return {}
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'session', resettable: true})
export class SessionStore extends Store<SessionState> {
  constructor() {
    super(createInitialState())
  }
}
