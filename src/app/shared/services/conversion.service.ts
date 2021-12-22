import {Injectable} from '@angular/core'
import {StablecoinBigNumber, StablecoinService} from './blockchain/stablecoin.service'
import {BigNumber, BigNumberish} from 'ethers'
import {TokenPrice, TokenPriceBigNumber} from '../utils/token-price'
import {Token, TokenBigNumber} from '../utils/token'
import {formatUnits, parseUnits} from 'ethers/lib/utils'
import {getWindow} from '../utils/browser'

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  constructor(private stablecoin: StablecoinService) {
    getWindow().bignum = BigNumber
    getWindow().parseUnits = parseUnits
  }


  toStablecoin(amount: number | string): StablecoinBigNumber {
    // return BigNumber.from((Number(amount) * (10 ** this.stablecoin.precision)).toFixed().toString())
    console.log('toStablecoin')
    console.log(amount)
    console.log(String(amount))
    console.log(parseUnits(String(amount), this.stablecoin.precision))
    return parseUnits(String(amount), this.stablecoin.precision)
  }

  toToken(amount: number | string): StablecoinBigNumber {
    // return BigNumber.from((Number(amount) * (10 ** 18)).toString())
    console.log('toToken')
    console.log(amount)
    console.log(String(amount))
    console.log(parseUnits(String(amount), 18))
    return parseUnits(String(amount), 18)
  }

  toTokenPrice(amount: number | string): TokenPriceBigNumber {
    // return BigNumber.from((TokenPrice.format(Number(amount))).toString())
    return parseUnits(String(amount), TokenPrice.precision)
  }

  parseStablecoin(value: StablecoinBigNumber): number {
    return this.weiToNumber(value, this.stablecoin.precision)
  }

  parseToken(value: TokenBigNumber): number {
    return this.weiToNumber(value)
  }

  parseTokenPrice(value: TokenPriceBigNumber): number {
    return TokenPrice.parse(Number(value.toString()))
  }

  // `stablecoin = token * tokenPrice`
  calcStablecoin(token: TokenBigNumber, tokenPrice: TokenPriceBigNumber): StablecoinBigNumber {
    return token
      .mul(tokenPrice)
      .mul(BigNumber.from((10 ** this.stablecoin.precision).toString()))
      .div(BigNumber.from((10 ** TokenPrice.precision).toString()))
      .div(BigNumber.from((10 ** Token.precision).toString()))
  }

  // `token = stablecoin / tokenPrice`
  calcTokens(stablecoin: StablecoinBigNumber, tokenPrice: TokenPriceBigNumber): TokenBigNumber {
    return stablecoin
      .mul(BigNumber.from((10 ** TokenPrice.precision).toString()))
      .mul(BigNumber.from((10 ** Token.precision).toString()))
      .div(tokenPrice)
      .div(BigNumber.from((10 ** this.stablecoin.precision).toString()))
  }

  // `tokenPrice = stablecoin / token`
  calcTokenPrice(stablecoin: StablecoinBigNumber, token: TokenBigNumber): TokenPriceBigNumber {
    return stablecoin
      .mul(BigNumber.from((10 ** Token.precision).toString()))
      .mul(BigNumber.from((10 ** TokenPrice.precision).toString()))
      .div(token)
      .div(BigNumber.from((10 ** this.stablecoin.precision).toString()))
  }

  scale(value: BigNumber, scaleValue: number, precision = 6): BigNumber {
    return value.mul(BigNumber.from((scaleValue * (10 ** precision)).toFixed().toString()))
      .div(BigNumber.from((10 ** precision).toString()))
  }


  weiToNumber(wei: BigNumberish, precision = 18): number {
    return Number(formatUnits(wei, precision))
  }
}
