/**
 * Token price stored in `cfManager` (campaign) contract state. The value is always
 * scaled to 10^4 of the preferred token price in `asset`'s stablecoin.
 *
 * Examples:
 * `asset`'s stablecoin currency is USDC.
 * If the preferred token price is `12.53` (USDC), the token price will be stored as `125300` in the contract.
 * If the preferred token price is `0.058` (USDC), the token price will be stored as `580` in the contract.
 * If the preferred token price is `0.0101` (USDC), the token price will be stored as `101` in the contract.
 * If the preferred token price is `0.000567` (USDC), the token price will be stored as `5` in the contract.
 */
import { BigNumber } from 'ethers'

export class TokenPrice {
  static readonly precision = 4
  static readonly scale = 10 ** TokenPrice.precision

  static format(value: number): number {
    return Math.floor(Number(value) * TokenPrice.scale)
  }

  static parse(value: number): number {
    return value / TokenPrice.scale
  }
}

/**
 * TokenPriceBigNumber is a regular BigNumber, but scaled to token price format.
 */
export type TokenPriceBigNumber = BigNumber
