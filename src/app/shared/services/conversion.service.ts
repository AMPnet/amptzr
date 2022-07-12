import { Injectable } from '@angular/core'
import {
  StablecoinBigNumber,
  StablecoinService,
} from './blockchain/stablecoin.service'
import { BigNumber } from 'ethers'
import { TokenPrice, TokenPriceBigNumber } from '../utils/token-price'
import { Token, TokenBigNumber } from '../utils/token'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  constructor(private stablecoin: StablecoinService) {}

  ///
  // (number | string) -> BigNumber
  ///

  toStablecoin(amount: number | string): StablecoinBigNumber {
    return parseUnits(String(amount), this.stablecoin.config.decimals)
  }

  toToken(
    amount: number | string,
    precision = Token.precision
  ): StablecoinBigNumber {
    return parseUnits(String(amount), precision)
  }

  toTokenPrice(amount: number | string): TokenPriceBigNumber {
    return parseUnits(String(amount), TokenPrice.precision)
  }

  ///
  // BigNumber -> string
  ///

  parseStablecoin(value: StablecoinBigNumber): string {
    return formatUnits(value, this.stablecoin.config.decimals)
  }

  parseToken(value: TokenBigNumber, precision = Token.precision): string {
    return formatUnits(value, precision)
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

  parseTokenToNumber(
    value: TokenBigNumber,
    precision = Token.precision
  ): number {
    return Number(this.parseToken(value, precision))
  }

  parseTokenPriceToNumber(value: TokenPriceBigNumber): number {
    return Number(this.parseTokenPrice(value))
  }

  // `stablecoin = token * tokenPrice`
  calcStablecoin(
    token: TokenBigNumber,
    tokenPrice: TokenPriceBigNumber
  ): StablecoinBigNumber {
    return token
      .mul(tokenPrice)
      .mul(this.pow10(this.stablecoin.config.decimals))
      .div(this.pow10(TokenPrice.precision))
      .div(this.pow10(Token.precision))
  }

  // `token = stablecoin / tokenPrice`
  calcTokens(
    stablecoin: StablecoinBigNumber,
    tokenPrice: TokenPriceBigNumber
  ): TokenBigNumber {
    return stablecoin
      .mul(this.pow10(TokenPrice.precision))
      .mul(this.pow10(Token.precision))
      .div(tokenPrice)
      .div(this.pow10(this.stablecoin.config.decimals))
  }

  // `tokenPrice = stablecoin / token`
  calcTokenPrice(
    stablecoin: StablecoinBigNumber,
    token: TokenBigNumber
  ): TokenPriceBigNumber {
    return stablecoin
      .mul(this.pow10(Token.precision))
      .mul(this.pow10(TokenPrice.precision))
      .div(token)
      .div(this.pow10(this.stablecoin.config.decimals))
  }

  scale(value: BigNumber, scaleValue: number, precision = 18): BigNumber {
    return value
      .mul(parseUnits(String(scaleValue), precision))
      .div(this.pow10(precision))
  }

  trim(
    value: BigNumber,
    decimals: number | 'stablecoin' = 18,
    trimDecimals = 0
  ): BigNumber {
    if (decimals === 'stablecoin') decimals = this.stablecoin.config.decimals
    const totalDecimals = Math.max(decimals - trimDecimals, 0)

    return value.div(this.pow10(totalDecimals)).mul(this.pow10(totalDecimals))
  }

  private pow10(to: number): BigNumber {
    return parseUnits('1', to)
  }
}
