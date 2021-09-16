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
  maxGasPrice: number,
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
  maxGasPrice: 100,
  rpcURLs: ['https://polygon-rpc.com'],
  explorerURLs: ['https://polygonscan.com/'],
  tokenizerConfig: {
    apxRegistry: '0xC5C69f646E94abD4D169a0b8a4F4A493360BF7F9',
    issuerFactory: '0xb0077f54f6d35C269aB7b231179Cac634a38F52e',
    assetFactory: '0x8C5202317643cb4C80A6160Dad3b7f2d2De1872B',
    assetTransferableFactory: '0x6bEcC917b7937d3180768c555Cd17Ad5e3cD2BC1',
    cfManagerFactory: '0x341408B1B56c67478639b0446C419c607bEB84E9',
    payoutManagerFactory: '0x65d1987c95FE89509366ee1B0CF250E0c00083DC',
    deployerService: '0xb1EA65089c3525BC4F4287Ea83E0E594cDA00b30',
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
  maxGasPrice: 20,
  rpcURLs: ['https://matic-mumbai.chainstacklabs.com'],
  explorerURLs: ['https://mumbai.polygonscan.com/'],
  tokenizerConfig: {
    apxRegistry: '0xb46979536849360806B48143065A10D4E309D966',
    issuerFactory: '0x664cF91d5E484bF4520Eec22d1ca8ce9324f9946',
    assetFactory: '0x3E5B2f3aDBd431BF838B84E25907CC0580C738c3',
    assetTransferableFactory: '0xdA6a8abd23dA1aDf3e9d3Ed91DB65017D1c571f8',
    cfManagerFactory: '0x086726c8bE64b946AEd142726dE00B3cf52098B7',
    payoutManagerFactory: '0x1EaF0DA71e593F28BC67a0C3C09BA7d52364124F',
    deployerService: '0x1F1FCc012D4b901cb88d4B958052D301F62F9bF3',
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
  _defaultProvider: (_providers: any) =>
    new providers.StaticJsonRpcProvider({
      url: network.rpcURLs[0],
    }),
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
