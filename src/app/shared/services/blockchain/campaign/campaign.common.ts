import { BigNumber } from 'ethers'
import { CampaignFlavor } from '../flavors'
import { cid } from '../../../../../../types/ipfs/common'
import { address } from '../../../../../../types/common'

export interface CampaignCommonState {
  flavor: CampaignFlavor | string
  version: string
  contractAddress: address
  owner: address
  info: cid
  asset: address
  stablecoin: address
  softCap: BigNumber
  finalized: boolean
  canceled: boolean
  pricePerToken: BigNumber
  fundsRaised: BigNumber
  tokensSold: BigNumber
}
