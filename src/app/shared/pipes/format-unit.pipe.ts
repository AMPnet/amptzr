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
      default:
        throw new Error(`Invalid safe type specified: ${operation}`)
    }
  }
}

enum Operation {
  BIGNUM_TO_WEI = 'bignumToWei'
}
