import {Injectable} from '@angular/core';
import {Query} from '@datorama/akita';
import {SessionState, SessionStore} from './session.store';
import {map} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class SessionQuery extends Query<SessionState> {
  address$ = this.select('address');
  isLoggedIn$ = this.select()
    .pipe(map(SessionQuery.stateIsLoggedIn));

  constructor(protected store: SessionStore) {
    super(store);
  }

  static stateIsLoggedIn(state: SessionState): boolean {
    return !(state.address === '' ||
      state.providerType === '');
  }

  isLoggedIn(): boolean {
    return SessionQuery.stateIsLoggedIn(this.store._value());
  }
}
