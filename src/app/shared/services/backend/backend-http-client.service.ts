import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, of, throwError } from 'rxjs'
import {
  catchError,
  concatMap,
  filter,
  map,
  pairwise,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators'
import { JwtTokenService } from './jwt-token.service'
import { ErrorService } from '../error.service'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { DialogService } from '../dialog.service'
import { SignerService } from '../signer.service'
import { RouterService } from '../router.service'
import { AuthProvider } from '../../../preference/state/preference.store'

@Injectable({
  providedIn: 'root',
})
export class BackendHttpClient {
  constructor(
    public http: HttpClient,
    private errorService: ErrorService,
    private preferenceQuery: PreferenceQuery,
    private signerService: SignerService,
    private dialogService: DialogService,
    private router: RouterService,
    private jwtTokenService: JwtTokenService
  ) {
    this.subscribeToChanges()
  }

  get ensureAuth(): Observable<unknown> {
    return of(this.jwtTokenService.isLoggedIn()).pipe(
      concatMap((isLoggedIn) =>
        isLoggedIn ? of(undefined) : this.loginProcedure
      )
    )
  }

  private get loginProcedure(): Observable<any> {
    return this.signerService.ensureAuth.pipe(
      map(() => this.preferenceQuery.getValue().address!),
      switchMap((address) =>
        this.jwtTokenService.getSignPayload(address).pipe(
          switchMap((resToSign) => this.authDialog(resToSign)),
          switchMap((resToSign) =>
            this.signerService
              .signMessage(resToSign.payload)
              .pipe(catchError(() => throwError(() => 'SIGNING_INTERRUPTED')))
          ),
          switchMap((signedPayload) =>
            this.jwtTokenService.authJWT(address, signedPayload)
          ),
          this.errorService.handleError(false, true)
        )
      )
    )
  }
  get<T>(
    path: string,
    params?: object,
    publicRoute = false,
    apiProtectedRoute = false,
    shouldHandleErrors = true
  ): Observable<T> {
    return (publicRoute ? of(undefined) : this.ensureAuth).pipe(
      switchMap(() => {
        const httpOptions = this.authHttpOptions(publicRoute, apiProtectedRoute)
        if (params) httpOptions.params = params

        return this.http.get<T>(path, httpOptions)
      }),
      this.handleError(shouldHandleErrors)
    )
  }

  post<T>(
    path: string,
    body: any,
    publicRoute = false,
    shouldHandleErrors = true,
    apiProtectedRoute = false
  ): Observable<T> {
    return (publicRoute ? of(undefined) : this.ensureAuth).pipe(
      switchMap(() =>
        this.http.post<T>(
          path,
          body,
          this.authHttpOptions(publicRoute, apiProtectedRoute)
        )
      ),
      this.handleError(shouldHandleErrors)
    )
  }

  put<T>(
    path: string,
    body: any,
    publicRoute = false,
    shouldHandleErrors = true
  ): Observable<T> {
    return (publicRoute ? of(undefined) : this.ensureAuth).pipe(
      switchMap(() =>
        this.http.put<T>(path, body, this.authHttpOptions(publicRoute))
      ),
      this.handleError(shouldHandleErrors)
    )
  }

  delete<T>(
    path: string,
    params?: object,
    publicRoute = false,
    shouldHandleErrors = true
  ): Observable<T | unknown> {
    return (publicRoute ? of(undefined) : this.ensureAuth).pipe(
      switchMap(() => {
        const httpOptions = this.authHttpOptions(publicRoute)
        if (params) httpOptions.params = params

        return this.http.delete<T>(path, httpOptions)
      }),
      this.handleError(shouldHandleErrors)
    )
  }

  logout(): Observable<void> {
    return this.jwtTokenService.logout()
  }

  public authHttpOptions(
    publicRoute = false,
    apiProtectedRoute = false
  ): HttpOptions {
    const httpOptions: HttpOptions = {
      headers: new HttpHeaders(),
    }
    httpOptions.headers.append('Connection', 'Keep-Alive')

    if (this.jwtTokenService.accessToken !== null && !publicRoute) {
      httpOptions.headers = httpOptions.headers.append(
        'Authorization',
        `Bearer ${this.jwtTokenService.accessToken}`
      )
    }

    const apiKey = this.preferenceQuery.getValue().apiKey
    if (apiKey !== null && apiProtectedRoute) {
      httpOptions.headers = httpOptions.headers.append('X-API-Key', apiKey)
    }

    return httpOptions
  }

  private authDialog<T>(payload: T) {
    switch (this.preferenceQuery.getValue().authProvider) {
      case AuthProvider.MAGIC:
        return of(payload)
      default:
        return this.dialogService
          .info({
            icon: '/assets/dialog-icons/sign.png',
            title: 'Authorization required',
            message:
              'You will be asked to authorize yourself by signing a message.',
            cancelable: false,
          })
          .pipe(
            switchMap((confirm) =>
              confirm ? of(payload) : throwError(() => 'SIGNING_DISMISSED')
            )
          )
    }
  }

  private handleError =
    (handleErrors: boolean) => (source: Observable<any>) => {
      return source.pipe(handleErrors ? this.errorService.handleError() : tap())
    }

  private subscribeToChanges() {
    this.preferenceQuery.address$
      .pipe(
        startWith(''),
        pairwise(),
        filter(([last, curr]) => !!last && last !== curr)
      )
      .pipe(switchMap(() => this.logout()))
      .subscribe()
  }
}

interface HttpOptions {
  headers: HttpHeaders
  params?: {}
}
