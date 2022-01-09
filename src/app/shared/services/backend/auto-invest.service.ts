import {Injectable} from '@angular/core'
import {Observable, of} from 'rxjs'
import {environment} from '../../../../environments/environment'
import {catchError} from "rxjs/operators"
import {BackendHttpClient} from "./backend-http-client.service"
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {StablecoinBigNumber} from '../blockchain/stablecoin.service'
import {SessionQuery} from '../../../session/state/session.query'

@Injectable({
  providedIn: 'root',
})
export class AutoInvestService {
  path = `${environment.backendURL}/api/identity/auto_invest`

  constructor(private http: BackendHttpClient,
              private preferenceQuery: PreferenceQuery,
              private sessionQuery: SessionQuery) {
  }

  submit(amount: StablecoinBigNumber, campaignAddress: string): Observable<void> {
    return this.http.post<void>(`${this.path}/${this.preferenceQuery.network.chainID}/${campaignAddress}`, {
      amount: amount.toString(),
    }).pipe(
      catchError(() => of(undefined)), // TODO: remove
    )
  }

  status(): Observable<StatusRes> {
    return this.http.get<StatusRes>(
      `${this.path}/${this.preferenceQuery.network.chainID}/${this.sessionQuery.getValue().address}`,
      {}, true,
    )
  }
}

interface StatusRes {
  auto_invests: {
    wallet_address: string
    campaign_address: string
    amount: string
  }[]
}
