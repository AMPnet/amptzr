import {Injectable} from '@angular/core'
import {StablecoinBigNumber, StablecoinService} from './blockchain/stablecoin.service'
import {BigNumber} from 'ethers'
import {TokenPrice, TokenPriceBigNumber} from '../utils/token-price'
import {Token, TokenBigNumber} from '../utils/token'
import {formatUnits, parseUnits} from 'ethers/lib/utils'

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  constructor(private stablecoin: StablecoinService) {
  }

  ///
  // (number | string) -> BigNumber
  ///

  toStablecoin(amount: number | string): StablecoinBigNumber {
    return parseUnits(String(amount), this.stablecoin.precision)
  }

  toToken(amount: number | string): StablecoinBigNumber {
    return parseUnits(String(amount), Token.precision)
  }

  toTokenPrice(amount: number | string): TokenPriceBigNumber {
    return parseUnits(String(amount), TokenPrice.precision)
  }

  ///
  // BigNumber -> string
  ///

  parseStablecoin(value: StablecoinBigNumber): string {
    return formatUnits(value, this.stablecoin.precision)
  }

  parseToken(value: TokenBigNumber): string {
    return formatUnits(value, Token.precision)
  }

  parseTokenPrice(value: TokenPriceBigNumber): string {
    return formatUnits(value, TokenPrice.precision)
  }

  ///
  // BigNumber -> number
  ///

  parseStablecoinToNumber(value: StablecoinBigNumber): number {
    return Number(this.parseStablecoin(value))
  }

  parseTokenToNumber(value: TokenBigNumber): number {
    return Number(this.parseToken(value))
  }

  parseTokenPriceToNumber(value: TokenPriceBigNumber): number {
    return Number(this.parseTokenPrice(value))
  }

  // `stablecoin = token * tokenPrice`
  calcStablecoin(token: TokenBigNumber, tokenPrice: TokenPriceBigNumber): StablecoinBigNumber {
    return token
      .mul(tokenPrice)
      .mul(this.pow10(this.stablecoin.precision))
      .div(this.pow10(TokenPrice.precision))
      .div(this.pow10(Token.precision))
  }

  // `token = stablecoin / tokenPrice`
  calcTokens(stablecoin: StablecoinBigNumber, tokenPrice: TokenPriceBigNumber): TokenBigNumber {
    return stablecoin
      .mul(this.pow10(TokenPrice.precision))
      .mul(this.pow10(Token.precision))
      .div(tokenPrice)
      .div(this.pow10(this.stablecoin.precision))
  }

  // `tokenPrice = stablecoin / token`
  calcTokenPrice(stablecoin: StablecoinBigNumber, token: TokenBigNumber): TokenPriceBigNumber {
    return stablecoin
      .mul(this.pow10(Token.precision))
      .mul(this.pow10(TokenPrice.precision))
      .div(token)
      .div(this.pow10(this.stablecoin.precision))
  }

  scale(value: BigNumber, scaleValue: number, precision = 18): BigNumber {
    return value.mul(parseUnits(String(scaleValue), precision))
      .div(this.pow10(precision))
  }

  private pow10(to: number): BigNumber {
    return parseUnits('1', to)
  }
}
