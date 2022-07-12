import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { BackendHttpClient } from './backend-http-client.service'
import { shareReplay } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class BackendUserService {
  path = `${environment.backendURL}/api/identity`

  constructor(private http: BackendHttpClient) {}

  getUser(): Observable<BackendUser> {
    return this.http
      .get<BackendUser>(`${this.path}/user`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }))
  }

  updateUser(userUpdate: UserUpdate): Observable<BackendUser> {
    return this.http.put<BackendUser>(`${this.path}/user`, userUpdate)
  }

  whitelistUser(data: WhitelistUserData): Observable<void> {
    return this.http.post<void>(`${this.path}/user/whitelist`, data)
  }
}

export interface BackendUser {
  address: string
  email: string | null
  email_verified: boolean
  kyc_completed: boolean
}

interface UserUpdate {
  email: string
}

interface WhitelistUserData {
  issuer_address: string
  chain_id: number
}
