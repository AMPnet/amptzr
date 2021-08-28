import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {Transaction, TransactionType} from '../../shared/services/backend/report.service'
import {CampaignService} from '../../shared/services/blockchain/campaign.service'
import {Observable, of} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {map} from 'rxjs/operators'

@Component({
  selector: 'app-wallet-tx-history-item',
  templateUrl: './wallet-tx-history-item.component.html',
  styleUrls: ['./wallet-tx-history-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletTxHistoryItemComponent implements OnInit {
  @Input() tx!: Transaction

  txView$!: Observable<TxView>
  entityName$!: Observable<WithStatus<string>>

  constructor(private campaignService: CampaignService) {
  }

  ngOnInit() {
    this.txView$ = of(this.tx).pipe(
      map(tx => ({
        ...tx,
        typeName: this.txTypeName(tx.type),
        sign: this.txSign(tx.type),
        isOutgoing: this.isOutgoing(tx.type),
      }) as TxView),
    )

    this.entityName$ = withStatus(this.getName(this.tx))
  }

  isOutgoing(txType: TransactionType) {
    return txType === TransactionType.RESERVE_INVESTMENT
  }

  txSign(txType: TransactionType) {
    return this.isOutgoing(txType) ? '-' : '+'
  }

  txTypeName(value: TransactionType): string {
    if (!value) {
      return ''
    }

    switch (value) {
      case TransactionType.RESERVE_INVESTMENT:
        return 'Investment'
      case TransactionType.CANCEL_INVESTMENT:
        return 'Cancel investment'
      case TransactionType.REVENUE_SHARE:
        return 'Revenue claim'
    }
  }

  getName(tx: Transaction): Observable<string> {
    switch (tx.type) {
      case TransactionType.RESERVE_INVESTMENT:
        return this.campaignName(tx.contract)
      case TransactionType.CANCEL_INVESTMENT:
        return this.campaignName(tx.contract)
      case TransactionType.REVENUE_SHARE:
        return of(tx.asset)
    }
  }

  private campaignName(address: string) {
    return this.campaignService.getCampaignWithInfo(address).pipe(
      map(campaign => campaign.name),
    )
  }
}

interface TxView extends Transaction {
  typeName: string
  sign: string
  isOutgoing: boolean
}
