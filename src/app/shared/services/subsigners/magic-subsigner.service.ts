import { Injectable } from '@angular/core'
import {
  combineLatest,
  defer,
  from,
  Observable,
  of,
  throwError,
  timer,
} from 'rxjs'
import { providers } from 'ethers'
import {
  catchError,
  concatMap,
  map,
  switchMap,
  take,
  tap,
  timeout,
} from 'rxjs/operators'
import {
  AuthProvider,
  PreferenceStore,
} from '../../../preference/state/preference.store'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { SDKBase } from '@magic-sdk/provider/dist/types/core/sdk'
import {
  AuthMagicComponent,
  MagicLoginInput,
} from '../../../auth/auth-magic/auth-magic.component'
import { MatDialog } from '@angular/material/dialog'
import { IssuerService } from '../blockchain/issuer/issuer.service'
import { OAuthExtension } from '@magic-ext/oauth'
import { getWindow } from '../../utils/browser'
import { RouterService } from '../router.service'
import { SignerLoginOpts, Subsigner } from '../signer-login-options'

@Injectable({
  providedIn: 'root',
})
export class MagicSubsignerService implements Subsigner<MagicLoginOpts> {
  subprovider: (SDKBase & OAuthSDK) | undefined

  DEFAULT_API_KEY = "pk_live_2675FA67C83167F9"

  apiKey$: Observable<string> = of(this.DEFAULT_API_KEY)

  isAvailable$: Observable<boolean> = defer(() =>
    this.apiKey$.pipe(map((apiKey) => !!apiKey))
  )

  constructor(
    private preferenceStore: PreferenceStore,
    private preferenceQuery: PreferenceQuery,
    private issuerService: IssuerService,
    private matDialog: MatDialog,
    private router: RouterService
  ) {}

  login(opts: MagicLoginOpts): Observable<providers.JsonRpcSigner> {
    return this.registerMagic.pipe(
      map((p) => new providers.Web3Provider(p as any).getSigner()),
      concatMap((signer) => this.checkAuthenticated(signer, opts)),
      concatMap((signer) => this.setAddress(signer))
    )
  }

  logout(): Observable<unknown> {
    return of(this.subprovider?.user).pipe(
      switchMap((user) => (user ? user.logout() : of(null))),
      tap(() => (this.subprovider = undefined))
    )
  }

  private setAddress(signer: providers.JsonRpcSigner) {
    return from(signer.getAddress()).pipe(
      tap((address) =>
        this.preferenceStore.update({
          address: address,
          authProvider: AuthProvider.MAGIC,
        })
      ),
      map(() => signer)
    )
  }

  get registerMagic() {
    if (this.subprovider) {
      return of(this.subprovider.rpcProvider)
    }

    return combineLatest([this.apiKey$]).pipe(
      take(1),
      switchMap(([apiKey]) => {
        if (!apiKey) {
          return throwError(
            () => 'Magic link is not configured for this issuer.'
          )
        }

        return from(
          import(
            /* webpackChunkName: "magic-sdk" */
            'magic-sdk'
          )
        ).pipe(
          map((lib) => {
            return new lib.Magic(apiKey, {
              network: {
                chainId: this.preferenceQuery.network.chainID,
                rpcUrl: this.preferenceQuery.network.rpcURLs[0],
              },
              extensions: [new OAuthExtension()],
            })
          }),
          tap((subprovider) => (this.subprovider = subprovider)),
          map((subprovider) => subprovider.rpcProvider)
        )
      })
    )
  }

  private checkAuthenticated(
    signer: providers.JsonRpcSigner,
    opts: MagicLoginOpts
  ): Observable<providers.JsonRpcSigner> {
    return of(opts.force).pipe(
      concatMap((force) =>
        force
          ? this.forceLogin(opts)
          : from(this.subprovider!.user.isLoggedIn())
      ),
      concatMap((authRes) =>
        authRes ? of(authRes) : throwError(() => 'NO_ADDRESS')
      ),
      concatMap(() => of(signer))
    )
  }

  private forceLogin(opts: MagicLoginOpts): Observable<boolean> {
    return of(opts).pipe(
      switchMap((opts) => {
        if (!!opts.socialProvider) {
          localStorage.setItem(
            'callbackUrl',
            this.router.constructURL('/callback')
          )
          localStorage.setItem(
            'redirectBack',
            `${getWindow().location.pathname}${getWindow().location.search}`
          )

          return combineLatest([
            this.subprovider!.oauth.loginWithRedirect({
              provider: opts.socialProvider,
              redirectURI: `${getWindow().location.origin}/callback`,
            }),
            // due to Magic issue, oauth.loginWithRedirect resolves immediately,
            // without waiting for OAuth redirect, therefore breaking loading UI
            timer(10_000),
          ]).pipe(timeout(20_000))
        } else if (!!opts.idToken) {
          return from(this.subprovider!.user.isLoggedIn()).pipe(
            concatMap((isLoggedIn) =>
              isLoggedIn
                ? of(true)
                : from(this.subprovider!.auth.loginWithCredential(opts.idToken))
            )
          )
        } else {
          return this.getEmail(opts).pipe(
            concatMap((email) =>
              this.subprovider!.auth.loginWithMagicLink({ email })
            )
          )
        }
      }),
      map((res) => !!res),
      catchError(() => of(false))
    )
  }

  private getEmail(opts: MagicLoginOpts): Observable<string> {
    return opts.email ? of(opts.email) : this.getEmailWithDialog()
  }

  private getEmailWithDialog(): Observable<string> {
    return this.matDialog
      .open(AuthMagicComponent)
      .afterClosed()
      .pipe(switchMap((input: MagicLoginInput) => input.email))
  }

  showSettings() {
    return from(this.subprovider!.user.showSettings())
  }

  getMetadata() {
    return from(this.subprovider!.user.getMetadata())
  }
}

interface OAuthSDK {
  oauth: Omit<OAuthExtension, 'name' | 'init' | 'config' | 'compat'>
}

interface MagicLoginOpts extends SignerLoginOpts {
  email?: string
  socialProvider?: 'google' | 'facebook' | 'apple'
  idToken: string
}
