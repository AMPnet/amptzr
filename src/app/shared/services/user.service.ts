import { Injectable } from '@angular/core'
import { SignerService } from './signer.service'
import {
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  shareReplay,
  switchMap,
} from 'rxjs/operators'
import { BackendHttpClient } from './backend/backend-http-client.service'
import { combineLatest, from, Observable, of } from 'rxjs'
import { SessionQuery } from '../../session/state/session.query'
import { IssuerService } from './blockchain/issuer/issuer.service'
import { BigNumber, constants } from 'ethers'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { AuthProvider } from '../../preference/state/preference.store'
import { MagicSubsignerService } from './subsigners/magic-subsigner.service'
import { BackendUserService } from './backend/backend-user.service'
import { withInterval } from '../utils/observables'

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isAdmin$: Observable<boolean>
  nativeTokenBalance$: Observable<BigNumber>

  constructor(
    private signerService: SignerService,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private issuerService: IssuerService,
    private magicSubsignerService: MagicSubsignerService,
    private backendUserService: BackendUserService,
    private http: BackendHttpClient
  ) {
    this.isAdmin$ = combineLatest([
      this.sessionQuery.isLoggedIn$,
      this.preferenceQuery.address$,
      this.issuerService.issuer$,
    ]).pipe(
      map(([isLoggedIn, address, issuer]) => {
        if (!isLoggedIn || !address) {
          return false
        }

        return address.toLowerCase() === issuer.owner.toLowerCase()
      }),
      distinctUntilChanged(),
      shareReplay(1)
    )

    this.nativeTokenBalance$ = combineLatest([
      this.sessionQuery.provider$,
      this.preferenceQuery.address$,
    ]).pipe(
      switchMap(([provider, address]) => {
        if (!address) return of(constants.Zero)

        return withInterval(from(provider.getBalance(address)), 3_000)
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.preferenceQuery.isBackendAuthorized$
      .pipe(
        pairwise(),
        filter(
          ([prev, curr]) =>
            !prev &&
            curr &&
            this.preferenceQuery.getValue().authProvider === AuthProvider.MAGIC
        ),
        concatMap(() => this.backendUserService.getUser()),
        filter((user) => !user.email),
        concatMap(() =>
          this.magicSubsignerService.getMetadata().pipe(
            filter((magic) => !!magic.email),
            concatMap((magic) =>
              this.backendUserService.updateUser({ email: magic.email! })
            )
          )
        )
      )
      .subscribe()
  }

  logout() {
    return this.signerService.logout().pipe(switchMap(() => this.http.logout()))
  }
}
