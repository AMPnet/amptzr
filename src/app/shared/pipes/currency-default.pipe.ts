import {CurrencyPipe} from '@angular/common'
import {Injectable, Pipe, PipeTransform} from '@angular/core'
import {StablecoinService} from '../services/blockchain/stablecoin.service'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'currencyDefault',
})
export class CurrencyDefaultPipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe,
              private stablecoin: StablecoinService) {
  }

  transform(
    value: number | string,
    type: Type = 'stablecoin',
  ) {
    const symbol = this.stablecoin.symbol
    switch (type) {
      case 'stablecoin':
        return this.transformCurrency(value, '1.0-2', symbol)
      case 'tokenPrice':
        return this.transformCurrency(value, '1.0-4', symbol)
    }
  }

  private transformCurrency(value: number | string, format: string, symbol: string,): string | null {
    if (symbol === 'USDC') {
      return this.currencyPipe.transform(value, 'USD', 'symbol', format, 'en')
    }

    return this.currencyPipe.transform(value, `${symbol} `, 'code', format, 'en')
  }
}

type Type = 'stablecoin' | 'tokenPrice'
