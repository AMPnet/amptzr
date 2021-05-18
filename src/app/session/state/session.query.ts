import {Injectable} from '@angular/core';
import {Query} from '@datorama/akita';
import {SessionState, SessionStore} from './session.store';
import {map} from 'rxjs/operators';
import {ethers} from 'ethers';

@Injectable({providedIn: 'root'})
export class SessionQuery extends Query<SessionState> {
  address$ = this.select('address');
  isLoggedIn$ = this.select()
    .pipe(map(this.stateIsLoggedIn));

  constructor(protected store: SessionStore) {
    super(store);
  }

  stateIsLoggedIn(state: SessionState): boolean {
    return !!state.address &&
      !!state.signer;
  }

  get signer(): ethers.providers.JsonRpcSigner | undefined {
    return this.store._value().signer;
  }

  isLoggedIn(): boolean {
    return this.stateIsLoggedIn(this.store._value());
  }
}
