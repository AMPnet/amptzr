import {Injectable} from '@angular/core'
import {catchError, concatMap, take} from 'rxjs/operators'
import {PreferenceStore, WalletProvider} from './preference.store'
import {EMPTY, Observable} from 'rxjs'
import {PreferenceQuery} from './preference.query'
import {SignerService} from '../../shared/services/signer.service'
import {MetamaskSubsignerService} from '../../shared/services/subsigners/metamask-subsigner.service'
import {WalletConnectSubsignerService} from '../../shared/services/subsigners/walletconnect-subsigner.service'
import {VenlySubsignerService} from '../../shared/services/subsigners/venly-subsigner.service';

@Injectable({providedIn: 'root'})
export class PreferenceService {
  constructor(private preferenceStore: PreferenceStore,
              private preferenceQuery: PreferenceQuery,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private walletConnectSubsignerService: WalletConnectSubsignerService,
              private venlySubsignerService: VenlySubsignerService,
              private signer: SignerService) {
  }

  initSigner(): Observable<unknown> {
    return this.preferenceQuery.select().pipe(
      take(1),
      concatMap(session => {
        if (session.address !== '' && session.providerType === WalletProvider.METAMASK) {
          return this.signer.login(this.metamaskSubsignerService, {force: false})
        } else if (session.address !== '' && session.providerType === WalletProvider.WALLET_CONNECT) {
          return this.signer.login(this.walletConnectSubsignerService, {force: false})
        } else if (session.address !== '' && session.providerType === WalletProvider.ARKANE) {
          return this.signer.login(this.venlySubsignerService, {force: false})
        } else {
          return EMPTY
        }
      }),
      catchError(() => {
        return this.signer.logout().pipe(concatMap(() => EMPTY))
      })
    )
  }
}
