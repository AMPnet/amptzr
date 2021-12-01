import {AssetFlavor} from '../flavors'
import {BigNumber} from 'ethers'

export interface AssetCommonState {
    flavor: AssetFlavor | string;
    version: string;
    contractAddress: string;
    owner: string;
    info: string;
    name: string;
    symbol: string;
    totalSupply: BigNumber;
    decimals: BigNumber;
    issuer: string;
}
