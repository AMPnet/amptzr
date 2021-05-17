import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface SignerState {
   key: string;
}

export function createInitialState(): SignerState {
  return {
    key: ''
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'signer' })
export class SignerStore extends Store<SignerState> {

  constructor() {
    super(createInitialState());
  }

}
