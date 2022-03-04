import {Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {Observable, of} from 'rxjs'
import {catchError, finalize, tap} from 'rxjs/operators'
import {environment} from '../../../../environments/environment'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {PreferenceStore} from '../../../preference/state/preference.store'

@Injectable({
  providedIn: 'root',
})
export class JwtTokenService {
  path = `${environment.backendURL}/api/identity`

  constructor(private http: HttpClient,
              private preferenceQuery: PreferenceQuery,
              private preferenceStore: PreferenceStore) {
  }

  getSignPayload(address: string) {
    return this.http.post<{ payload: string }>(`${this.path}/authorize`, {
      address: address,
    })
  }

  authJWT(address: string, signedPayload: string) {
    return this.http.post<AuthJWTResponse>(`${this.path}/authorize/jwt`, {
      address: address,
      signed_payload: signedPayload,
      chain_id: this.preferenceQuery.network.chainID,
    }).pipe(
      this.saveTokens(),
    )
  }

  logout(): Observable<void> {
    if (!this.isLoggedIn()) return of(undefined)

    return this.http.post<void>(`${this.path}/user/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    }).pipe(
      catchError(() => of(undefined)),
      finalize(() => this.removeTokens()),
    )
  }

  isLoggedIn(): boolean {
    return !!this.getJWTUserAddress()
  }

  refreshAccessToken() {
    return this.http.post<AuthJWTResponse>(`${this.path}/authorize/refresh`, {
      refresh_token: this.refreshToken,
    }).pipe(
      this.saveTokens(),
    )
  }

  getJWTUserAddress(): string | null {
    try {
      const payload: JWTPayload = JSON.parse(atob(this.accessToken.split('.')[1]))
      return payload.address
    } catch (_err) {
      return null
    }
  }

  get accessToken() {
    return this.preferenceQuery.getValue().JWTAccessToken || ''
  }

  set accessToken(value: string) {
    this.preferenceStore.update({JWTAccessToken: value})
  }

  get refreshToken() {
    return this.preferenceQuery.getValue().JWTRefreshToken || ''
  }

  set refreshToken(value: string) {
    this.preferenceStore.update({JWTRefreshToken: value})
  }

  private saveTokens = () => (source: Observable<AuthJWTResponse>) => {
    return source.pipe(
      tap(res => {
        this.accessToken = res.access_token
        this.refreshToken = res.refresh_token
      }),
    )
  }

  removeTokens() {
    this.preferenceStore.update({
      JWTAccessToken: '',
      JWTRefreshToken: '',
    })
  }
}

interface AuthJWTResponse {
  access_token: string;
  expires_in: number; // millis
  refresh_token: string;
  refresh_token_expires_in: number; // millis
}

interface JWTPayload {
  sub: string;
  address: string;
  iat: number;
  exp: number;
}
