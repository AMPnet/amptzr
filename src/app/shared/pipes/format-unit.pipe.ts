import {Pipe, PipeTransform} from '@angular/core'
import {TokenPrice} from '../utils/token-price'
import {StablecoinService} from '../services/blockchain/stablecoin.service'

@Pipe({
  name: 'formatUnit',
})
export class FormatUnitPipe implements PipeTransform {
  constructor(private stablecoin: StablecoinService) {
  }

  public transform(value: any, operation: Operation | string) {
    switch (operation) {
      case Operation.BIGNUM_TO_WEI:
        switch (typeof value) {
          case 'number':
            return this.stablecoin.format(BigInt(value).toString())
          default:
            return this.stablecoin.format(value)
        }
      case Operation.PARSE_TOKEN_PRICE:
        return TokenPrice.parse(value)
      case Operation.TO_NUMBER:
        return Number(value)
      default:
        throw new Error(`Invalid format unit type specified: ${operation}`)
    }
  }
}

enum Operation {
  BIGNUM_TO_WEI = 'bignumToWei',
  PARSE_TOKEN_PRICE = 'parseTokenPrice',
  TO_NUMBER = 'toNumber',
}
