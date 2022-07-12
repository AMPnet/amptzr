import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { BackendHttpClient } from './backend-http-client.service'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { StablecoinBigNumber } from '../blockchain/stablecoin.service'

@Injectable({
  providedIn: 'root',
})
export class AutoInvestService {
  path = `${environment.backendURL}/api/identity/auto_invest`

  constructor(
    private http: BackendHttpClient,
    private preferenceQuery: PreferenceQuery
  ) {}

  submit(
    amount: StablecoinBigNumber,
    campaignAddress: string
  ): Observable<void> {
    return this.http.post<void>(
      `${this.path}/${this.preferenceQuery.network.chainID}/${campaignAddress}`,
      {
        amount: amount.toString(),
      }
    )
  }

  status(address: string): Observable<StatusRes> {
    return this.http.get<StatusRes>(
      `${this.path}/${this.preferenceQuery.network.chainID}/${address}`,
      {},
      true
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
