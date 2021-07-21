import {Injectable} from '@angular/core'
import {HttpClient, HttpHeaders} from '@angular/common/http'
import {defer, EMPTY, Observable, of, throwError} from 'rxjs'
import {catchError, concatMap, finalize, map, switchMap} from 'rxjs/operators'
import {JwtTokenService} from './jwt-token.service'
import {ErrorService} from '../error.service'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {DialogService} from '../dialog.service'
import {SessionQuery} from '../../../session/state/session.query'
import {SignerService} from '../signer.service'
import {Router} from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class BackendHttpClient {
  constructor(public http: HttpClient,
              private errorService: ErrorService,
              private preferenceQuery: PreferenceQuery,
              private sessionQuery: SessionQuery,
              private signerService: SignerService,
              private dialogService: DialogService,
              private router: Router,
              private jwtTokenService: JwtTokenService) {
  }

  get<T>(path: string, params?: object, publicRoute = false, shouldHandleErrors = true): Observable<T> {
    return defer(() => {
      const httpOptions = this.authHttpOptions(publicRoute)

      if (params) httpOptions.params = params

      return this.http.get<T>(path, httpOptions)
    }).pipe(this.handleError(shouldHandleErrors))
  }

  post<T>(path: string, body: any, publicRoute = false, shouldHandleErrors = true): Observable<T> {
    return defer(() => this.http.post<T>(path, body, this.authHttpOptions(publicRoute))).pipe(
      this.handleError(shouldHandleErrors),
    )
  }

  put<T>(path: string, body: object, shouldHandleErrors = true): Observable<T> {
    return defer(() => this.http.put<T>(path, body, this.authHttpOptions())).pipe(
      this.handleError(shouldHandleErrors),
    )
  }

  delete<T>(path: string, params?: object, shouldHandleErrors = true): Observable<T | unknown> {
    return defer(() => {
      const httpOptions = this.authHttpOptions()
      if (params) httpOptions.params = params

      return this.http.delete<T>(path, httpOptions)
    }).pipe(
      this.handleError(shouldHandleErrors),
    )
  }

  get ensureAuth(): Observable<unknown> {
    return of(this.jwtTokenService.isLoggedIn()).pipe(
      concatMap(isLoggedIn => isLoggedIn ?
        of(undefined) : this.loginProcedure,
      ),
      catchError(() => EMPTY),
    )
  }

  private get loginProcedure(): Observable<any> {
    return this.signerService.ensureAuth.pipe(
      map(() => this.sessionQuery.getValue().address!),
      switchMap(address => this.jwtTokenService.getSignPayload(address).pipe(
        switchMap(resToSign => this.dialogService.info(
          'You will be asked to authorize yourself by signing a message.',
        ).pipe(switchMap(confirm => confirm ? of(resToSign) : throwError('SIGNING_DISMISSED')))),
        switchMap(resToSign => this.signerService.signMessage(resToSign.payload).pipe(
          catchError(() => throwError('SIGNING_INTERRUPTED')),
        )),
        switchMap(signedPayload => this.jwtTokenService.authJWT(address, signedPayload)),
        this.errorService.handleError(false, true),
      )),
      catchError(() => this.router.navigate(['/identity'])),
    )
  }

  logout(): Observable<void> {
    return this.jwtTokenService.logout().pipe(
      finalize(() => {
        // this.cacheService.clearAll()
      }),
    )
  }

  public authHttpOptions(publicRoute = false): HttpOptions {
    const httpOptions: HttpOptions = {
      headers: new HttpHeaders(),
    }
    httpOptions.headers.append('Connection', 'Keep-Alive')

    if (this.jwtTokenService.accessToken !== null && !publicRoute) {
      httpOptions.headers = httpOptions
        .headers.append('Authorization', `Bearer ${this.jwtTokenService.accessToken}`)
    }

    return httpOptions
  }

  private handleError = (handleErrors: boolean) => (source: Observable<any>) =>
    source.pipe(handleErrors ? this.errorService.handleError() : () => EMPTY)
}

interface HttpOptions {
  headers: HttpHeaders
  params?: {}
}
