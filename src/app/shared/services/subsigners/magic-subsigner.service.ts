import {Injectable} from '@angular/core'
import {Subsigner, SubsignerLoginOpts} from './metamask-subsigner.service'
import {combineLatest, defer, from, Observable, of, throwError} from 'rxjs'
import {providers} from 'ethers'
import {catchError, concatMap, map, switchMap, take, tap} from 'rxjs/operators'
import {AuthProvider, PreferenceStore} from '../../../preference/state/preference.store'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {SDKBase} from '@magic-sdk/provider/dist/types/core/sdk'
import {AuthMagicComponent, MagicLoginInput} from '../../../auth/auth-magic/auth-magic.component'
import {MatDialog} from '@angular/material/dialog'
import {IssuerService} from '../blockchain/issuer/issuer.service'

@Injectable({
  providedIn: 'root',
})
export class MagicSubsignerService implements Subsigner {
  subprovider: SDKBase | undefined

  apiKey$: Observable<string> = defer(() => combineLatest([this.issuerService.issuer$]).pipe(
    take(1),
    map(([issuer]) => issuer.infoData.magicLinkApiKey),
  ))
  isAvailable$: Observable<boolean> = defer(() => this.apiKey$.pipe(map(apiKey => !!apiKey)))

  constructor(
    private preferenceStore: PreferenceStore,
    private preferenceQuery: PreferenceQuery,
    private issuerService: IssuerService,
    private matDialog: MatDialog,
  ) {
  }

  login(opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return this.registerMagic.pipe(
      map(p => new providers.Web3Provider(p as any).getSigner()),
      concatMap(signer => this.checkAuthenticated(signer, opts)),
      concatMap(signer => this.setAddress(signer)),
    )
  }

  logout(): Observable<unknown> {
    return of(this.subprovider?.user).pipe(
      switchMap(user => user ? user.logout() : of(null)),
    )
  }

  private setAddress(signer: providers.JsonRpcSigner) {
    return from(signer.getAddress()).pipe(
      tap(address => this.preferenceStore.update({
        address: address,
        authProvider: AuthProvider.MAGIC,
      })),
      map(() => signer),
    )
  }

  private get registerMagic() {
    return combineLatest([this.apiKey$]).pipe(
      take(1),
      switchMap(([apiKey]) => {
        if (!apiKey) {
          return throwError(() => 'Magic link is not configured for this issuer.')
        }

        return from(
          import(
            /* webpackChunkName: "magic-sdk" */
            'magic-sdk')).pipe(
          map((lib) => {
            return new lib.Magic(apiKey, {
              network: {
                chainId: this.preferenceQuery.network.chainID,
                rpcUrl: this.preferenceQuery.network.rpcURLs[0],
              },
            })
          }),
          tap(subprovider => this.subprovider = subprovider),
          map(subprovider => subprovider.rpcProvider),
        )
      }),
    )
  }

  private checkAuthenticated(signer: providers.JsonRpcSigner,
                             opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return of(opts.force).pipe(
      concatMap(force => force ?
        this.forceLogin(opts) :
        from(this.subprovider!.user.isLoggedIn()),
      ),
      concatMap(authRes => authRes ? of(authRes) : throwError(() => 'NO_ADDRESS')),
      concatMap(() => of(signer)),
    )
  }

  private forceLogin(opts: SubsignerLoginOpts): Observable<boolean> {
    return this.getEmail(opts).pipe(
      switchMap(email => this.subprovider!.auth.loginWithMagicLink({email})),
      map(res => !!res),
      catchError(() => of(false)),
    )
  }

  private getEmail(opts: SubsignerLoginOpts): Observable<string> {
    return opts.email ? of(opts.email) : this.getEmailWithDialog()
  }

  private getEmailWithDialog(): Observable<string> {
    return this.matDialog.open(AuthMagicComponent).afterClosed().pipe(
      switchMap((input: MagicLoginInput) => input.email),
    )
  }

  showSettings() {
    return from(this.subprovider!.user.showSettings())
  }

  getMetadata() {
    return from(this.subprovider!.user.getMetadata())
  }
}
