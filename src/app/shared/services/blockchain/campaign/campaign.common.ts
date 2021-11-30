import {BigNumber} from 'ethers'
import {CampaignFlavor} from '../flavors'
import {cid} from '../../../../../../types/ipfs/campaign'

export interface CampaignCommonState {
  flavor: CampaignFlavor | string;
  version: string;
  contractAddress: string;
  owner: string;
  info: cid;
  asset: string;
  stablecoin: string;
  softCap: BigNumber;
  finalized: boolean;
  canceled: boolean;
  pricePerToken: BigNumber;
  fundsRaised: BigNumber;
  tokensSold: BigNumber;
}
