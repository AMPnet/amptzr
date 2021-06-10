import {Injectable} from '@angular/core'
import {Store, StoreConfig} from '@datorama/akita'
import {providers} from 'ethers'
import {AuthProvider} from '../../preference/state/preference.store'

export interface SessionState {
  address?: string;
  authProvider?: AuthProvider | '';
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
