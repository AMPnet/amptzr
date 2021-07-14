import {providers, utils} from 'ethers'
import {SecretType} from '@arkane-network/arkane-connect/dist/src/models/SecretType'

export enum ChainID {
  // ETHEREUM_MAINNET = 1,
  // GOERLI_TESTNET = 5,
  MATIC_MAINNET = 137, // Polygon
  MUMBAI_TESTNET = 80001, // Polygon
}

export interface Network {
  chainID: ChainID,
  name: string,
  shortName: string,
  nativeCurrency: {
    name: string,
    symbol: string;
  },
  rpcURLs: string[],
  explorerURLs: string[]
}

export const MaticNetwork: Network = {
  chainID: ChainID.MATIC_MAINNET,
  name: 'Matic',
  shortName: 'matic',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcURLs: ['https://rpc-mainnet.maticvigil.com'],
  explorerURLs: ['https://explorer-mainnet.maticvigil.com/'],
}

export const MumbaiNetwork: Network = {
  chainID: ChainID.MUMBAI_TESTNET,
  name: 'Mumbai (Matic Testnet)',
  shortName: 'mumbai',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcURLs: ['https://matic-mumbai.chainstacklabs.com'],
  explorerURLs: ['https://explorer-mumbai.maticvigil.com/'],
}

const getEthersNetwork = (network: Network): providers.Network => ({
  name: network.shortName,
  chainId: network.chainID,
  _defaultProvider: (providers: any) =>
    new providers.JsonRpcProvider(network.rpcURLs[0]),
})

export const EthersNetworks: { [key in ChainID]: providers.Network } = {
  [ChainID.MATIC_MAINNET]: getEthersNetwork(MaticNetwork),
  [ChainID.MUMBAI_TESTNET]: getEthersNetwork(MumbaiNetwork),
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

const getMetamaskNetwork = (network: Network): AddEthereumChainParameter => ({
  chainId: utils.hexValue(network.chainID),
  chainName: network.name,
  nativeCurrency: {
    name: network.nativeCurrency.name,
    symbol: network.nativeCurrency.symbol,
    decimals: 18,
  },
  rpcUrls: network.rpcURLs,
  blockExplorerUrls: network.explorerURLs,
})

export const MetamaskNetworks: { [key in ChainID]: AddEthereumChainParameter } = {
  [ChainID.MATIC_MAINNET]: getMetamaskNetwork(MaticNetwork),
  [ChainID.MUMBAI_TESTNET]: getMetamaskNetwork(MumbaiNetwork),
}

export const VenlyNetworks: { [key in ChainID]: { secretType: SecretType, env: 'staging' | 'prod' } } = {
  [ChainID.MATIC_MAINNET]: {
    secretType: SecretType.MATIC,
    env: 'prod',
  },
  [ChainID.MUMBAI_TESTNET]: {
    secretType: SecretType.MATIC,
    env: 'staging',
  },
}

