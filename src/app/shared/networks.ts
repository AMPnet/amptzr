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
  issuerFactory: {
    basic: string,
  },
  assetFactory: {
    basic: string,
    transferable: string,
  }
  cfManagerFactory: {
    basic: string,
  },
  snapshotDistributorFactory: string,
  deployerService: string,
  queryService: string,
  nameRegistry: string,
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
    apxRegistry: '0xd72d91319E5ff36F34761B72a1e47e803Ce65743',
    issuerFactory: {
      basic: '0xa77d68e73752b4e4E6670032400f9a1Da522ed22',
    },
    assetFactory: {
      basic: '0x9e4a2d67e1b63ab1c46000161c8288d5e4dea075',
      transferable: '0xf80a26bf08af7c8c33d6f8cfcfe9641363ba788b',
    },
    cfManagerFactory: {
      basic: '0x3105e7FE2bb0DD528888192A4ffC08a1Bf5Ee789',
    },
    snapshotDistributorFactory: '0x1a88619a71d3D77FD8D75052825F863dAa1D415A',
    deployerService: '0xfe8a734d71D1754EC8f670676365aAf5408e7931',
    queryService: '0x142f05565D9e0562e7caA09bAf816D263615dfe6',
    nameRegistry: '0x40eD1E8f0E5ed20d114bCeBE55c7b7fd27567D5F',
    defaultWalletApprover: '0x5C028C472227c975BD64ae1050066302Aef4e14D',
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
    apxRegistry: '0x38428F2867c08A6D2aC96CD99181974F2b834d18',
    issuerFactory: {
      basic: '0x627174B8620C40b9Bf22038fe250e045bE341d02',
    },
    assetFactory: {
      basic: '0x78118349D98F46F054637B99424a3C2Eafd44730',
      transferable: '0x49907Ab78f01547D5c72288fa843D28d88eb0b81',
    },
    cfManagerFactory: {
      basic: '0xB978755ddD7Bf363E7f7B6bFa5ee53664C3E3415',
    },
    snapshotDistributorFactory: '0x0AD4188e90be630b19Ce62C525aA72dc39AD2Ab5',
    deployerService: '0x3F114782A6A6a7aA0bC6C0728Bf0D7C3B449b5e9',
    queryService: '0xc20186CFC26F9A274fDE21eD489b7851f6f04E91',
    nameRegistry: '0x592Fcd4A39705AA5307845De578c489826f35638',
    defaultWalletApprover: '0xf64337595A2c8a318E2D5337bC57288eaaB82061',
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
