import {Injectable} from '@angular/core'
import {catchError, concatMap, take, timeout} from 'rxjs/operators'
import {AuthProvider, PreferenceStore} from './preference.store'
import {EMPTY, Observable} from 'rxjs'
import {PreferenceQuery} from './preference.query'
import {SignerService} from '../../shared/services/signer.service'
import {MetamaskSubsignerService} from '../../shared/services/subsigners/metamask-subsigner.service'
import {WalletConnectSubsignerService} from '../../shared/services/subsigners/walletconnect-subsigner.service'
import {VenlySubsignerService} from '../../shared/services/subsigners/venly-subsigner.service'

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
      concatMap(pref => {
        if (pref.address === '') {
          return EMPTY
        }
        switch (pref.authProvider) {
          case AuthProvider.METAMASK:
            return this.signer.login(this.metamaskSubsignerService, {force: false})
          case AuthProvider.WALLET_CONNECT:
            return this.signer.login(this.walletConnectSubsignerService, {force: false})
          case AuthProvider.VENLY:
            return this.signer.login(this.venlySubsignerService, {force: false})
          default:
            return EMPTY
        }
      }),
      timeout(4000),
      catchError(() => {
        return this.signer.logout().pipe(concatMap(() => EMPTY))
      }),
    )
  }
}
