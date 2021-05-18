import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';

export interface PreferenceState {
  address: string;
  providerType: WalletProvider | '';
}

export function createInitialState(): PreferenceState {
  return {
    address: '',
    providerType: '',
  };
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'preference'})
export class PreferenceStore extends Store<PreferenceState> {

  constructor() {
    super(createInitialState());
  }

}

export enum WalletProvider {
  METAMASK = 'METAMASK',
  ARKANE = 'ARKANE',
}
