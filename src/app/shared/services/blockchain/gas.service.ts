import {Injectable} from '@angular/core'
import {from, Observable, of} from 'rxjs'
import {catchError, map} from 'rxjs/operators'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {BigNumber, Overrides} from 'ethers'
import {ChainID} from '../../networks'
import {HttpClient} from '@angular/common/http'
import {SessionQuery} from '../../../session/state/session.query'
import {parseUnits} from 'ethers/lib/utils'

@Injectable({
  providedIn: 'root',
})
export class GasService {
  constructor(private preferenceQuery: PreferenceQuery,
              private sessionQuery: SessionQuery,
              private http: HttpClient) {
  }

  get overrides(): Observable<Partial<Overrides>> {
    switch (this.preferenceQuery.network.chainID) {
      case ChainID.MATIC_MAINNET:
        return this.maticGasStation('https://gasstation-mainnet.matic.network')
      case ChainID.MUMBAI_TESTNET:
        return this.maticGasStation('https://gasstation-mumbai.matic.today')
      default:
        return this.defaultConfig()
    }
  }

  private maticGasStation(endpoint: string): Observable<Partial<Overrides>> {
    return this.http.get<GasStationRes>(endpoint).pipe(
      map(res => ({
        gasLimit: BigNumber.from(5_000_000),
        gasPrice: parseUnits(res.fast.toString(), 'gwei'),
      })),
      catchError(() => of({})),
    )
  }

  private defaultConfig(): Observable<Partial<Overrides>> {
    return from(this.sessionQuery.provider.getGasPrice()).pipe(
      map(gasPrice => ({
        gasLimit: BigNumber.from(5_000_000),
        gasPrice: parseUnits(gasPrice.toString(), 'gwei'),
      })),
      catchError(() => of({})),
    )
  }
}

interface GasStationRes {
  safeLow: number;
  standard: number;
  fast: number;
  fastest: number;
  blockTime: number;
  blockNumber: number;
}
