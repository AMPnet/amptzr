import {Injectable} from '@angular/core';
import {Query} from '@datorama/akita';
import {SessionState, SessionStore} from './session.store';

@Injectable({providedIn: 'root'})
export class SessionQuery extends Query<SessionState> {
  address$ = this.select('address');

  constructor(protected store: SessionStore) {
    super(store);
  }

  isLoggedIn(): boolean {
    const sessionSnapshot = this.store._value();
    return !(sessionSnapshot.address === '' ||
      sessionSnapshot.providerType === '');
  }
}
