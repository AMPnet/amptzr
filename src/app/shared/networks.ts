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
  name: 'Matic',
  shortName: 'matic',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcURLs: ['https://rpc-mainnet.maticvigil.com'],
  explorerURLs: ['https://explorer-mainnet.maticvigil.com/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: '0x0959b4eBf0Fe2D708C3DB22dc245a32a135Ef818',
    assetFactory: '0x46B01A62d03E2067bBfC6c88D2f2EEDC31cB75a9',
    assetTransferableFactory: '',
    cfManagerFactory: '0xA167Ac0C34C52a4a91a9c93618150b9ef508152C',
    payoutManagerFactory: '0x39d13eA4781F4FA57a347F5C49dD716048822F16',
    deployerService: '0x29aF1b53f2cb555B5621A9F13c24711A9EDdEC40',
    queryService: '0xF80a26Bf08AF7c8C33d6f8cFcFe9641363bA788b',
    defaultWalletApprover: '0x23B00A11F6DBbD3a850a0AE72668109133779575',
    defaultStableCoin: '0x18D71D80087084df631f95EF29C8a11904DC47F3',
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
  name: 'Mumbai (Matic Testnet)',
  shortName: 'mumbai',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcURLs: ['https://matic-mumbai.chainstacklabs.com'],
  explorerURLs: ['https://explorer-mumbai.maticvigil.com/'],
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
