import {IssuerFlavor} from '../flavors'

export interface IssuerCommonState {
  flavor: IssuerFlavor | string;
  version: string;
  contractAddress: string;
  owner: string;
  stablecoin: string;
  walletApprover: string;
  info: string;
}
