import { Pipe, PipeTransform } from '@angular/core'
import { ConversionService } from '../services/conversion.service'

@Pipe({
  name: 'formatUnit',
})
export class FormatUnitPipe implements PipeTransform {
  constructor(private conversion: ConversionService) {}

  public transform(
    value: any,
    operation: Operation | string,
    precision?: number
  ) {
    switch (operation) {
      case Operation.STABLECOIN:
        return this.conversion.parseStablecoinToNumber(
          this.toBigNumberish(value)
        )
      case Operation.TOKEN:
        return this.conversion.parseTokenToNumber(
          this.toBigNumberish(value),
          precision
        )
      case Operation.TOKEN_PRICE:
        return this.conversion.parseTokenPriceToNumber(value)
      case Operation.TO_NUMBER:
        return Number(value)
      default:
        throw new Error(`Invalid format unit type specified: ${operation}`)
    }
  }

  private toBigNumberish(value: any) {
    switch (typeof value) {
      case 'number':
        return BigInt(value).toString()
      default:
        return value
    }
  }
}

enum Operation {
  STABLECOIN = 'stablecoin',
  TOKEN = 'token',
  TOKEN_PRICE = 'tokenPrice',
  TO_NUMBER = 'toNumber',
}
