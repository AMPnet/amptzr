import {ChangeDetectionStrategy, Component} from '@angular/core'
import {ReportService} from '../../shared/services/backend/report.service'
import {withStatus} from '../../shared/utils/observables'
import {TransactionTypeNamePipe} from './transaction-type-name.pipe'

@Component({
  selector: 'app-wallet-tx-history',
  templateUrl: './wallet-tx-history.component.html',
  styleUrls: ['./wallet-tx-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TransactionTypeNamePipe],
})
export class WalletTxHistoryComponent {
  transactionHistory$ = withStatus(this.reportService.transactionHistory())

  constructor(private reportService: ReportService) {
  }

  downloadTransactionHistory() {
    return this.reportService.downloadTransactionHistoryReport()
  }
}
