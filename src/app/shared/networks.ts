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
    simple: string,
  }
  cfManagerFactory: {
    basic: string,
    vesting: string,
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
      simple: '0x0361B0A1333A0BF88ce2c3a4d7192C5E8A5Efea9',
    },
    cfManagerFactory: {
      basic: '0x3105e7FE2bb0DD528888192A4ffC08a1Bf5Ee789',
      vesting: '0x5009469A278Bcc572442c0144c07108156984176',
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
    apxRegistry: '0x2D3B123C7D53E537D449186386618301b4a93B22',
    issuerFactory: {
      basic: '0x95c406b7294c300308BAc5C722ffe3f1e4e0Cb75',
    },
    assetFactory: {
      basic: '0x19d22BBEc9F1aa1bB9AB0F172f5D9e6DDF9E6C47',
      transferable: '0x52997837b399d66A4d71b6E28fCed6Fb95B83fd9',
      simple: '0x0361B0A1333A0BF88ce2c3a4d7192C5E8A5Efea9',
    },
    cfManagerFactory: {
      basic: '0x3877230A7dE98DF02cCd7F23C46294F80b81F64f',
      vesting: '0x5009469A278Bcc572442c0144c07108156984176',
    },
    snapshotDistributorFactory: '0x13B7A1eaEba77B2c8C44b56bdE2863c4efDa8dd8',
    deployerService: '0x9132e92e6fc8E192f72087D8856014566C43145f',
    queryService: '0x85A9e3142c31E9a820643D59310C63E1605eeCE7',
    nameRegistry: '0x2D14cc9AcC1a638Fc8BF7d3eD0C9d79270194461',
    defaultWalletApprover: '0x622b12839a32FD4C9bc8B1Ff5D4D96DA41C86356',
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
