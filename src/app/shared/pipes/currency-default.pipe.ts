import {CurrencyPipe} from '@angular/common'
import {Injectable, Pipe, PipeTransform} from '@angular/core'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'currencyDefault',
})
export class CurrencyDefaultPipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe) {
  }

  transform(
    value: number,
    code = 'USD',
    display = 'symbol',
    digitsInfo = '1.0-2',
    locale = 'en',
  ) {
    return this.currencyPipe.transform(value / 100, code, display, digitsInfo, locale)
  }
}
