import {BigNumber} from 'ethers'
import {CampaignFlavor} from '../flavors'

export interface CampaignCommonState {
  flavor: CampaignFlavor | string;
  version: string;
  contractAddress: string;
  owner: string;
  info: string;
  asset: string;
  stablecoin: string;
  softCap: BigNumber;
  finalized: boolean;
  canceled: boolean;
  pricePerToken: BigNumber;
  fundsRaised: BigNumber;
  tokensSold: BigNumber;
}
