import {ethers} from 'ethers'

export enum ChainID {
  // ETHEREUM_MAINNET = 1,
  // GOERLI_TESTNET = 5,
  MATIC_MAINNET = 137, // Polygon
  MUMBAI_TESTNET = 80001, // Polygon
}

export const MaticNetwork: ethers.providers.Network = {
  name: 'matic',
  chainId: ChainID.MATIC_MAINNET,
  _defaultProvider: (providers: any) =>
    new providers.JsonRpcProvider('https://matic-mainnet.chainstacklabs.com')
}

export const MumbaiNetwork: ethers.providers.Network = {
  name: 'mumbai',
  chainId: ChainID.MUMBAI_TESTNET,
  _defaultProvider: providers =>
    new providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com')
}

export const Networks: { [key in ChainID]: ethers.providers.Network } = {
  [ChainID.MATIC_MAINNET]: MaticNetwork,
  [ChainID.MUMBAI_TESTNET]: MumbaiNetwork,
}

export interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

export const MetamaskNetworks: { [key in ChainID]: AddEthereumChainParameter } = {
  [ChainID.MATIC_MAINNET]: {
    chainId: ethers.utils.hexValue(MaticNetwork.chainId),
    chainName: 'Matic Network',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
    blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com/']
  },
  [ChainID.MUMBAI_TESTNET]: {
    chainId: ethers.utils.hexValue(MumbaiNetwork.chainId),
    chainName: 'Matic Test Network (Mumbai)',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com/']
  },
}


