import { CurrencyPipe, DecimalPipe } from '@angular/common'
import { Injectable, Pipe, PipeTransform } from '@angular/core'
import { StablecoinService } from '../services/blockchain/stablecoin.service'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'currencyDefault',
})
export class CurrencyDefaultPipe implements PipeTransform {
  constructor(
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private stablecoin: StablecoinService
  ) {}

  transform(
    value: number | string,
    type: Type = 'stablecoin',
    display: Display = 'real',
    currencySymbol?: string
  ) {
    const symbol = currencySymbol ?? this.stablecoin.config.symbol
    switch (type) {
      case 'stablecoin':
        return this.transformCurrency(value, '1.0-0', symbol, type, display)
      case 'token':
        return this.transformCurrency(value, '1.0-2', symbol, type, display)
      case 'tokenPrice':
        return this.transformCurrency(value, '1.0-4', symbol, type, display)
    }
  }

  private transformCurrency(
    value: number | string,
    format: string,
    symbol: string,
    type: Type,
    display: Display
  ): string | null {
    switch (type) {
      case 'stablecoin':
      case 'tokenPrice':
        switch (display) {
          case 'implicit':
            switch (symbol) {
              case 'USDC':
              case 'USDT':
              case 'DAI':
                return this.currencyPipe.transform(
                  value,
                  'USD',
                  'symbol',
                  format
                )
            }
        }
    }

    return `${this.decimalPipe.transform(value, format)} ${symbol}`
  }
}

type Type = 'stablecoin' | 'token' | 'tokenPrice'
type Display = 'real' | 'implicit'
