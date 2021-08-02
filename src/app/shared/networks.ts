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
  explorerURLs: string[],
  factoryConfig: FactoryConfig,
  venlyConfig: VenlyConfig
}

interface FactoryConfig {
  issuer: string,
  asset: string,
  cfManager: string,
  payoutManager: string,
}

interface VenlyConfig {
  secretType: SecretType
  env: 'staging' | 'prod'
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
  factoryConfig: {
    issuer: '0x089b0e790830B0B3CBaF12c5139C7FFd771086a0',
    asset: '0x1055A19E99eD45114eFBBE0fD2B59B21103A21C9',
    cfManager: '0xEB354529e80031C287cAE6e33432826Df4Ed9104',
    payoutManager: '0x39d13eA4781F4FA57a347F5C49dD716048822F16',
  },
  venlyConfig: {
    secretType: SecretType.MATIC,
    env: 'prod',
  },
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
  factoryConfig: {
    issuer: '0x089b0e790830B0B3CBaF12c5139C7FFd771086a0',
    asset: '0x1055A19E99eD45114eFBBE0fD2B59B21103A21C9',
    cfManager: '0xEB354529e80031C287cAE6e33432826Df4Ed9104',
    payoutManager: '0x39d13eA4781F4FA57a347F5C49dD716048822F16',
  },
  venlyConfig: {
    secretType: SecretType.MATIC,
    env: 'staging',
  },
}

export const Networks: { [key in ChainID]: Network } = {
  [ChainID.MATIC_MAINNET]: MaticNetwork,
  [ChainID.MUMBAI_TESTNET]: MumbaiNetwork,
}

const getEthersNetwork = (network: Network): providers.Network => ({
  name: network.shortName,
  chainId: network.chainID,
  _defaultProvider: (providers: any) =>
    new providers.JsonRpcProvider(network.rpcURLs[0]),
})

export const EthersNetworks = Object.fromEntries(Object.entries(Networks)
  .map((entry) => [entry[0], getEthersNetwork(entry[1])]),
)

interface AddEthereumChainParameter {
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

export const MetamaskNetworks = Object.fromEntries(Object.entries(Networks)
  .map((entry) => [entry[0], getMetamaskNetwork(entry[1])]),
)

export const VenlyNetworks = Object.fromEntries(Object.entries(Networks)
  .map((entry) => [entry[0], entry[1].venlyConfig]),
)
