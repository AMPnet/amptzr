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
              private stablecoinService: StablecoinService) {
  }

  // TODO: finish adding stablecoin symbol
  transform(
    value: number | string,
    code = 'USD',
    display = 'symbol',
    digitsInfo = '1.0-2',
    locale = 'en',
  ) {
    return this.currencyPipe.transform(value, code, display, digitsInfo, locale)
  }
}
