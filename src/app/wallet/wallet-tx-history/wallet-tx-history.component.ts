import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ReportService } from '../../shared/services/backend/report.service'
import { withStatus } from '../../shared/utils/observables'
import { BackendHttpClient } from '../../shared/services/backend/backend-http-client.service'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { switchMap } from 'rxjs/operators'
import { of } from 'rxjs'

@Component({
  selector: 'app-wallet-tx-history',
  templateUrl: './wallet-tx-history.component.html',
  styleUrls: ['./wallet-tx-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletTxHistoryComponent {
  isBackendAuthorized$ = this.preferenceQuery.isBackendAuthorized$

  transactionHistory$ = this.isBackendAuthorized$.pipe(
    switchMap((isAuth) =>
      withStatus(
        isAuth
          ? this.reportService.transactionHistory()
          : of({ transactions: [] })
      )
    )
  )

  constructor(
    private reportService: ReportService,
    private http: BackendHttpClient,
    private preferenceQuery: PreferenceQuery
  ) {}

  backendAuthorize() {
    return this.http.ensureAuth
  }

  downloadTransactionHistory() {
    return this.reportService.downloadTransactionHistoryReport()
  }
}
