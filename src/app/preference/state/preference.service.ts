import {Injectable} from '@angular/core';
import {catchError, concatMap, take} from 'rxjs/operators';
import {PreferenceStore, WalletProvider} from './preference.store';
import {EMPTY, Observable} from 'rxjs';
import {PreferenceQuery} from './preference.query';
import {SignerService} from '../../shared/services/signer.service';

@Injectable({providedIn: 'root'})
export class PreferenceService {
  constructor(private preferenceStore: PreferenceStore,
              private preferenceQuery: PreferenceQuery,
              private signer: SignerService) {
  }

  initSigner(): Observable<unknown> {
    return this.preferenceQuery.select().pipe(
      take(1),
      concatMap(session => session.address !== '' && session.providerType === WalletProvider.METAMASK ?
        this.signer.login({force: false}) : EMPTY
      ),
      catchError(() => {
        this.signer.logout();
        return EMPTY;
      })
    );
  }
}
