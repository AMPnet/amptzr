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
  tokenizerConfig: TokenizerConfig,
  venlyConfig: VenlyConfig,
  ramp: {
    swapAsset: string,
    fiatCurrency: string,
    url?: string // URL is needed only for testing environments, Ramp uses production version when URL is not specified
  }
}

interface TokenizerConfig {
  apxRegistry: string,
  issuerFactory: string,
  assetFactory: string,
  assetTransferableFactory: string,
  cfManagerFactory: string,
  payoutManagerFactory: string,
  deployerService: string,
  queryService: string,
  defaultWalletApprover: string,
  defaultStableCoin: string,
  childChainManager: string, // matic specific
}

interface VenlyConfig {
  secretType: SecretType
  env: 'staging' | 'prod'
}

export const MaticNetwork: Network = {
  chainID: ChainID.MATIC_MAINNET,
  name: 'Polygon',
  shortName: 'matic',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcURLs: ['https://polygon-mainnet.infura.io/v3/c9625ebec3634ce3a0bd20be405bac8c'],
  explorerURLs: ['https://polygonscan.com/'],
  tokenizerConfig: {
    apxRegistry: '0xC5C69f646E94abD4D169a0b8a4F4A493360BF7F9',
    issuerFactory: '0x153B1ae9f9cC6a8F3d1C85215F20DDb8471a5489',
    assetFactory: '0x81959cfBC145c4eE28c367Fc8F666B6724061D6f',
    assetTransferableFactory: '0x089b0e790830B0B3CBaF12c5139C7FFd771086a0',
    cfManagerFactory: '0xC0f4FBab2DFcfa5a9DDbC51B6E643CabdE78AA65',
    payoutManagerFactory: '0x39d13eA4781F4FA57a347F5C49dD716048822F16',
    deployerService: '0x72cbCdA86bE718c13Ca93C57D070D601b9820933',
    queryService: '0x1055A19E99eD45114eFBBE0fD2B59B21103A21C9',
    defaultWalletApprover: '0x3edE377caC124205F6f73635c1DC4eb2Da8d0399',
    defaultStableCoin: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    childChainManager: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
  },
  venlyConfig: {
    secretType: SecretType.MATIC,
    env: 'prod',
  },
  ramp: {
    swapAsset: 'MATIC_USDC',
    fiatCurrency: 'USD',
  },
}

export const MumbaiNetwork: Network = {
  chainID: ChainID.MUMBAI_TESTNET,
  name: 'Mumbai (Polygon Testnet)',
  shortName: 'mumbai',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcURLs: ['https://polygon-mumbai.infura.io/v3/c9625ebec3634ce3a0bd20be405bac8c'],
  explorerURLs: ['https://mumbai.polygonscan.com/'],
  tokenizerConfig: {
    apxRegistry: '0x0BBF3325306fa959412762Ab0D9a6E895392b8FF',
    issuerFactory: '0x4d2EbC8B12E6f9d5ee6d2412e0651cB0f603C54C',
    assetFactory: '0x416191CE0365601815b4e350AfC85358FA270edc',
    assetTransferableFactory: '0x4F4af5E074208Bc2cd52bDa250F01B15673A83E1',
    cfManagerFactory: '0x5bd07987231B62d7Fd18CA487cB7d56cf294e6c8',
    payoutManagerFactory: '0x39d13eA4781F4FA57a347F5C49dD716048822F16',
    deployerService: '0x116748cb89782C2f7dF4651C6ca5C163C6a35A6A',
    queryService: '0x25dFc73574EF3A16bF53A84E2394B4CaA5a5bc1a',
    defaultWalletApprover: '0xD449f575B45318f196ec806b84Fcbf3f9583F8dc',
    defaultStableCoin: '0x9733aa0fb74a01f058fbeb0ad9da3f483058908e',
    childChainManager: '0xb5505a6d998549090530911180f38aC5130101c6',
  },
  venlyConfig: {
    secretType: SecretType.MATIC,
    env: 'staging',
  },
  ramp: {
    swapAsset: 'MATIC_USDC2',
    fiatCurrency: 'USD',
    url: 'https://ri-widget-staging.firebaseapp.com/',
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
