import {Injectable} from '@angular/core'
import {Store, StoreConfig} from '@datorama/akita'
import {providers} from 'ethers'

export interface SessionState {
  signer?: providers.JsonRpcSigner;
  provider?: providers.Provider;
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
