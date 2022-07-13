import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { BackendHttpClient } from './backend-http-client.service'
import { PreferenceQuery } from '../../../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class FaucetService {
  path = `${environment.backendURL}/api/identity/faucet`

  constructor(
    private http: BackendHttpClient,
    private preferenceQuery: PreferenceQuery
  ) {}

  get topUp(): Observable<void> {
    return this.http.post<void>(
      `${this.path}/${this.preferenceQuery.network.chainID}`,
      {
        re_captcha_token: 'token', // TODO: implement recaptcha
      }
    )
  }
}
