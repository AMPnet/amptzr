import { Injectable } from '@angular/core'
import { catchError, concatMap, switchMap, take, timeout } from 'rxjs/operators'
import {
  AuthProvider,
  createInitialState,
  PreferenceStore,
} from './preference.store'
import { EMPTY, Observable, of } from 'rxjs'
import { PreferenceQuery } from './preference.query'
import { SignerService } from '../../shared/services/signer.service'
import { MetamaskSubsignerService } from '../../shared/services/subsigners/metamask-subsigner.service'
import { WalletConnectSubsignerService } from '../../shared/services/subsigners/walletconnect-subsigner.service'
import { environment } from '../../../environments/environment'
import { IssuerFlavor } from '../../shared/services/blockchain/flavors'
import { MagicSubsignerService } from '../../shared/services/subsigners/magic-subsigner.service'
import { getWindow } from '../../shared/utils/browser'
import { GnosisSubsignerService } from '../../shared/services/subsigners/gnosis-subsigner.service'
import { providers } from 'ethers'

@Injectable({ providedIn: 'root' })
export class PreferenceService {
  constructor(
    private preferenceStore: PreferenceStore,
    private preferenceQuery: PreferenceQuery,
    private metamaskSubsignerService: MetamaskSubsignerService,
    private magicSubsignerService: MagicSubsignerService,
    private gnosisSubsignerService: GnosisSubsignerService,
    private walletConnectSubsignerService: WalletConnectSubsignerService,
    private signer: SignerService
  ) {}

  private get tryImplicitLogin(): Observable<
    providers.JsonRpcSigner | undefined
  > {
    return of(getWindow() !== getWindow().parent).pipe(
      switchMap((isIframe) =>
        isIframe
          ? this.signer
              .login(this.gnosisSubsignerService)
              .pipe(catchError(() => of(undefined)))
          : of(undefined)
      )
    )
  }

  private get tryPreviousLogin(): Observable<
    providers.JsonRpcSigner | undefined
  > {
    return of(this.preferenceQuery.getValue()).pipe(
      concatMap((pref) => {
        if (pref.address === '') {
          return EMPTY
        }
        switch (pref.authProvider) {
          case AuthProvider.METAMASK:
            return this.signer.login(this.metamaskSubsignerService, {
              force: false,
            })
          case AuthProvider.MAGIC:
            return this.signer.login(this.magicSubsignerService, {
              force: false,
            })
          case AuthProvider.WALLET_CONNECT:
            return this.signer.login(this.walletConnectSubsignerService, {
              force: false,
            })
          default:
            return EMPTY
        }
      })
    )
  }

  initSigner(): Observable<unknown> {
    return this.tryImplicitLogin.pipe(
      switchMap(() => this.tryPreviousLogin),
      timeout(30_000),
      catchError((err) => {
        if (err === 'WRONG_NETWORK') return of(this.signer)

        return this.signer.logout().pipe(concatMap(() => EMPTY))
      })
    )
  }

  checkFixedConfig(): Observable<unknown> {
    return this.preferenceQuery.select().pipe(
      take(1),
      concatMap((pref) => {
        const fixedChainID = environment.fixed.chainID
        const fixedIssuer = environment.fixed.issuer
        const currentChainID = pref.chainID
        const currentIssuer = pref.issuer.address

        const chainIDMismatch = fixedChainID && fixedChainID !== currentChainID
        const issuerMismatch = fixedIssuer && fixedIssuer !== currentIssuer
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
      })
    )
  }

  resetIssuer() {
    this.preferenceStore.update({
      issuer: createInitialState().issuer,
    })
  }
}
