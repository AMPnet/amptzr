import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { SignerStore, SignerState } from './signer.store';

@Injectable({ providedIn: 'root' })
export class SignerQuery extends Query<SignerState> {

  constructor(protected store: SignerStore) {
    super(store);
  }

}
