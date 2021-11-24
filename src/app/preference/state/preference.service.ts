import {Injectable} from '@angular/core'
import {catchError, concatMap, take, timeout} from 'rxjs/operators'
import {AuthProvider, PreferenceStore} from './preference.store'
import {EMPTY, Observable, of} from 'rxjs'
import {PreferenceQuery} from './preference.query'
import {SignerService} from '../../shared/services/signer.service'
import {MetamaskSubsignerService} from '../../shared/services/subsigners/metamask-subsigner.service'
import {WalletConnectSubsignerService} from '../../shared/services/subsigners/walletconnect-subsigner.service'
import {VenlySubsignerService} from '../../shared/services/subsigners/venly-subsigner.service'
import {environment} from '../../../environments/environment'
import {IssuerFlavor} from '../../shared/services/blockchain/flavors'
import {MagicSubsignerService} from '../../shared/services/subsigners/magic-subsigner.service'

@Injectable({providedIn: 'root'})
export class PreferenceService {
  constructor(private preferenceStore: PreferenceStore,
              private preferenceQuery: PreferenceQuery,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private magicSubsignerService: MagicSubsignerService,
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
          case AuthProvider.MAGIC:
            return this.signer.login(this.magicSubsignerService, {force: false})
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

  checkFixedConfig(): Observable<unknown> {
    return this.preferenceQuery.select().pipe(
      take(1),
      concatMap(pref => {
        const fixedChainID = environment.fixed.chainID
        const fixedIssuer = environment.fixed.issuer
        const currentChainID = pref.chainID
        const currentIssuer = pref.issuer.address

        const chainIDMismatch = fixedChainID && (fixedChainID !== currentChainID)
        const issuerMismatch = fixedIssuer && (fixedIssuer !== currentIssuer)
        if (chainIDMismatch || issuerMismatch) {
          this.preferenceStore.update({
            chainID: fixedChainID,
            issuer: {
              address: fixedIssuer,
              flavor: IssuerFlavor.BASIC, // TODO: flavor should be added to fixed issuer configuration
            },
          })
        }

        return of(undefined)
      }),
    )
  }
}
