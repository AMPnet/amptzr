import {Injectable, Pipe, PipeTransform} from '@angular/core'
import {TransactionType} from '../services/backend/report.service'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'transactionTypeName',
})
export class TransactionTypeNamePipe implements PipeTransform {
  constructor() {
  }

  transform(value: '' | TransactionType | null | undefined): string {
    if (!value) {
      return ''
    }

    switch (value) {
      case TransactionType.INVEST:
        return 'Investment'
      case TransactionType.FINALIZE_INVEST:
        return 'Finalize investment'
      case TransactionType.CANCEL_INVEST:
        return 'Cancel investment'
      case TransactionType.REVENUE_CLAIM:
        return 'Revenue claim'
    }
  }
}
