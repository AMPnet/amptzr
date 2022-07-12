import { Injectable } from '@angular/core'
import { environment } from '../../../../environments/environment'
import { BackendHttpClient } from './backend-http-client.service'
import { DatePipe } from '@angular/common'
import { Observable } from 'rxjs'
import { ErrorService } from '../error.service'
import { map, switchMap } from 'rxjs/operators'
import { PreferenceQuery } from '../../../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  path = `${environment.backendURL}/api/report`

  constructor(
    private http: BackendHttpClient,
    private errorService: ErrorService,
    private preferenceQuery: PreferenceQuery,
    private datePipe: DatePipe
  ) {}

  transactionHistory(from?: Date, to?: Date): Observable<TransactionHistory> {
    const params = this.createFromToDateParams(from, to)
    const chainID = this.preferenceQuery.network.chainID
    const issuer = this.preferenceQuery.issuer.address
    return this.http.ensureAuth.pipe(
      switchMap(() =>
        this.http.get<TransactionHistory>(
          `${this.path}/tx_history/${chainID}/${issuer}`,
          params,
          false,
          false
        )
      )
    )
  }

  downloadTransactionHistoryReport(from?: Date, to?: Date): Observable<void> {
    const params = this.createFromToDateParams(from, to)
    return this.http.ensureAuth.pipe(
      switchMap(() =>
        this.http.http.get(
          `${this.path}/report/${this.preferenceQuery.network.chainID}/${this.preferenceQuery.issuer.address}/user/transactions`,
          {
            params: params,
            headers: this.http.authHttpOptions().headers,
            responseType: 'arraybuffer',
          }
        )
      ),
      this.errorService.handleError(),
      map((data) => {
        ReportService.downloadFile(
          data,
          this.timestampedFileName('UserTransactions', 'pdf', params),
          'application/pdf'
        )
      })
    )
  }

  downloadAdminInvestorsReport(): Observable<void> {
    return this.http.ensureAuth.pipe(
      switchMap(() =>
        this.http.http.get(
          `${this.path}/admin/${this.preferenceQuery.network.chainID}/${this.preferenceQuery.issuer.address}/report/xlsx`,
          {
            headers: this.http.authHttpOptions().headers,
            responseType: 'arraybuffer',
          }
        )
      ),
      this.errorService.handleError(),
      map((data) => {
        ReportService.downloadFile(
          data,
          this.timestampedFileName('InvestorsReport', 'xlsx'),
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      })
    )
  }

  private createFromToDateParams(from?: Date, to?: Date): DateFromToParams {
    const params: DateFromToParams = {}
    const format = 'yyyy-MM-dd'

    if (!!from) {
      params.from = this.datePipe.transform(from, format)!
    }

    if (!!to) {
      params.to = this.datePipe.transform(to, format)!
    }

    return params
  }

  private timestampedFileName(
    prefix: string,
    extension: string,
    params?: DateFromToParams
  ): string {
    return (
      [
        prefix,
        this.datePipe.transform(new Date(), 'yMdhhmmss'),
        `${!!params?.['from'] ? 'from' + params['from'] : ''}`,
        `${!!params?.['to'] ? 'to' + params['to'] : ''}`,
      ]
        .filter((text) => !!text)
        .join('_') +
      '.' +
      extension
    )
  }

  private static downloadFile(
    data: ArrayBuffer,
    fileName: string,
    type: string
  ): void {
    const file = new Blob([data], { type })
    const fileURL = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = fileURL
    link.download = fileName
    link.click()
  }
}

type DateFromToParams = { from?: string; to?: string }

type eth_address = string

export interface TransactionHistory {
  transactions: Transaction[]
}

export interface Transaction {
  from_address: eth_address
  to_address: eth_address
  contract: eth_address
  chain_id: number
  hash: string
  type: TransactionType
  asset: eth_address
  timestamp: number
  token_amount: BigInt
  token_value: BigInt
  payout_id: number
  revenue: BigInt
}

export enum TransactionType {
  RESERVE_INVESTMENT = 'RESERVE_INVESTMENT',
  CANCEL_INVESTMENT = 'CANCEL_INVESTMENT',
  REVENUE_SHARE = 'REVENUE_SHARE',
  COMPLETED_INVESTMENT = 'COMPLETED_INVESTMENT',
}
