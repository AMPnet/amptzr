import {Pipe, PipeTransform} from '@angular/core'
import {utils} from 'ethers'
import {TokenPrice} from '../utils/token-price'

@Pipe({
  name: 'formatUnit',
})
export class FormatUnitPipe implements PipeTransform {
  constructor() {
  }

  public transform(value: any, operation: Operation | string) {
    switch (operation) {
      case Operation.BIGNUM_TO_WEI:
        return Number(utils.formatEther(value))
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
