import {Injectable, Pipe, PipeTransform} from '@angular/core'
import { InvestmentAmountState } from 'src/app/invest/invest.component'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'invalidInvestment',
})
export class InvalidInvestmentPipe implements PipeTransform {
  constructor() {
  }

  transform(value: InvestmentAmountState | null): string | null {
    switch(value) {
        case InvestmentAmountState.Empty: return null
        case InvestmentAmountState.Valid: return null
        case InvestmentAmountState.NotEnoughFunds: return "Not enough funds. Please fill wallet"
        case InvestmentAmountState.InvestmentAmountTooHigh: return "Amount exceeds maximum allowed investment"
        case InvestmentAmountState.InvestmentAmountTooLow: return "Amount is lower than minimum required investment"
    }
    return ''
  }
}
