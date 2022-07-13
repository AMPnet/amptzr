import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core'
import {
  Transaction,
  TransactionType,
} from '../../shared/services/backend/report.service'
import { Observable, of } from 'rxjs'
import { withStatus, WithStatus } from '../../shared/utils/observables'
import { map, switchMap } from 'rxjs/operators'
import { NameService } from '../../shared/services/blockchain/name.service'
import { CampaignService } from '../../shared/services/blockchain/campaign/campaign.service'

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

  constructor(
    private campaignService: CampaignService,
    private nameService: NameService
  ) {}

  ngOnInit() {
    this.txView$ = of(this.tx).pipe(
      map(
        (tx) =>
          ({
            ...tx,
            typeName: this.txTypeName(tx.type),
            sign: this.txSign(tx.type),
            isOutgoing: this.isOutgoing(tx.type),
          } as TxView)
      )
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
      case TransactionType.COMPLETED_INVESTMENT:
        return 'Completed investment'
      case TransactionType.REVENUE_SHARE:
        return 'Revenue claim'
    }
  }

  getName(tx: Transaction): Observable<string> {
    switch (tx.type) {
      case TransactionType.RESERVE_INVESTMENT:
      case TransactionType.CANCEL_INVESTMENT:
      case TransactionType.COMPLETED_INVESTMENT:
        return this.campaignName(tx.contract)
      case TransactionType.REVENUE_SHARE:
        return of(tx.asset)
    }
  }

  private campaignName(address: string) {
    return this.nameService.getCampaign(address).pipe(
      switchMap((campaign) =>
        this.campaignService.getCampaignInfo(campaign.campaign)
      ),
      map((campaign) => campaign.infoData.name)
    )
  }
}

interface TxView extends Transaction {
  typeName: string
  sign: string
  isOutgoing: boolean
}
