import { AssetFlavor } from '../flavors'
import { BigNumber } from 'ethers'
import { address } from '../../../../../../types/common'
import { cid } from '../../../../../../types/ipfs/common'

export interface AssetCommonState {
  flavor: AssetFlavor | string
  version: string
  contractAddress: address
  owner: address
  info: cid
  name: string
  symbol: string
  totalSupply: BigNumber
  decimals: number
  issuer: address
}
