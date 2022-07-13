import { IssuerFlavor } from '../flavors'
import { address } from '../../../../../../types/common'
import { cid } from '../../../../../../types/ipfs/common'

export interface IssuerCommonState {
  flavor: IssuerFlavor | string
  version: string
  contractAddress: address
  owner: address
  stablecoin: address
  walletApprover: address
  info: cid
}
