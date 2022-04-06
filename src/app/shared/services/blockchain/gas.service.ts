import {Injectable} from '@angular/core'
import {from, Observable, of, switchMap} from 'rxjs'
import {catchError, map} from 'rxjs/operators'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {Overrides} from 'ethers'
import {HttpClient} from '@angular/common/http'
import {SessionQuery} from '../../../session/state/session.query'
import {parseUnits} from 'ethers/lib/utils'
import {ChainID} from '../../networks'
import {AuthProvider} from '../../../preference/state/preference.store'

@Injectable({
  providedIn: 'root',
})
export class GasService {
  constructor(private preferenceQuery: PreferenceQuery,
              private sessionQuery: SessionQuery,
              private http: HttpClient) {
  }

  get overrides(): Observable<Partial<Overrides>> {
    // TODO: temporarily removed due to magic issues
    // if (this.shouldUseGasStation) {
    //   return this.gasPriceOracleOverrides
    // }

    return this.isEip1559Supported.pipe(
      switchMap(isEip1559Supported => isEip1559Supported ?
        of({}) : this.gasPriceOracleOverrides,
      ),
    )
  }

  private get isEip1559Supported(): Observable<boolean> {
    if (!this.sessionQuery.signer) return of(false)

    return from(this.sessionQuery.signer.provider.getFeeData()).pipe(
      map(data => (data.maxFeePerGas != null || data.maxPriorityFeePerGas != null)),
    )
  }

  private get shouldUseGasStation() {
    return this.preferenceQuery.getValue().authProvider === AuthProvider.MAGIC
  }

  private get gasPriceOracleOverrides(): Observable<Partial<Overrides>> {
    switch (this.preferenceQuery.network.chainID) {
      case ChainID.MATIC_MAINNET:
        return this.maticGasStation('https://gasstation-mainnet.matic.network')
      case ChainID.MUMBAI_TESTNET:
        return this.maticGasStation('https://gasstation-mumbai.matic.today')
      default:
        return of({})
    }
  }

  private maticGasStation(endpoint: string): Observable<Partial<Overrides>> {
    return this.http.get<GasStationRes>(endpoint).pipe(
      map(res => {
        const gasPrice = Math.min(this.preferenceQuery.network.maxGasPrice, res.fast)
        return {
          gasPrice: parseUnits(gasPrice.toString(), 'gwei'),
        }
      }),
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
