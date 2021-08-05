import {Pipe, PipeTransform} from '@angular/core'
import {utils} from 'ethers'

@Pipe({
  name: 'formatUnit',
})
export class FormatUnitPipe implements PipeTransform {
  constructor() {
  }

  public transform(value: any, operation: Operation | string) {
    switch (operation) {
      case Operation.BIGNUM_TO_WEI:
        return utils.formatEther(value)
      case Operation.PARSE_TOKEN_PRICE:
        return Number(value) / 10_000
      case Operation.TO_TOKEN_PRICE:
        return Number(value) * 10_000
      case Operation.TO_NUMBER:
        return Number(value)
      default:
        throw new Error(`Invalid safe type specified: ${operation}`)
    }
  }
}

enum Operation {
  BIGNUM_TO_WEI = 'bignumToWei',
  PARSE_TOKEN_PRICE = 'parseTokenPrice',
  TO_TOKEN_PRICE = 'toTokenPrice',
  TO_NUMBER = 'toNumber',
}
