import {Injectable} from '@angular/core';
import {catchError} from 'rxjs/operators';
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
    const session = this.preferenceQuery.getValue();
    if (session.address !== '' && session.providerType === WalletProvider.METAMASK) {
      return this.signer.login({force: false}).pipe(
        catchError(() => {
          this.signer.logout();
          return EMPTY;
        }),
      );
    }

    return EMPTY;
  }
}
