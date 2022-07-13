import { BigNumber } from 'ethers'

export class Token {
  static readonly precision = 18
  static readonly scale = 10 ** Token.precision

  static format(value: number): number {
    return Math.floor(Number(value) * Token.scale)
  }

  static parse(value: number): number {
    return Number(value) / Token.scale
  }
}

/**
 * TokenBigNumber is a regular BigNumber, but scaled to token format.
 */
export type TokenBigNumber = BigNumber
