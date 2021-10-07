import {providers, utils} from 'ethers'
import {SecretType} from '@arkane-network/arkane-connect/dist/src/models/SecretType'

export enum ChainID {
  MATIC_MAINNET = 137, // Polygon
  MUMBAI_TESTNET = 80001, // Polygon
  // ETHEREUM_MAINNET = 1,
  GOERLI_TESTNET = 5,
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
  venlyConfig?: VenlyConfig,
  ramp?: RampConfig,
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

interface RampConfig {
  swapAsset: string,
  url?: string // needed only for testing environments
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
    apxRegistry: '0x992EF576A79b7D3d05C31DfBCc389362F158c812',
    issuerFactory: {
      basic: '0x05372FE88cA46a6Bc1EFFC6eA7C3E15B7E3c9d29',
    },
    assetFactory: {
      basic: '0x77e74FDa88df9468A006fC07c5D3a464f99a52A2',
      transferable: '0xDbc97cc1d74D77c5cB1A7e6fC26F055B8F56d4EF',
      simple: '0x0361B0A1333A0BF88ce2c3a4d7192C5E8A5Efea9',
    },
    cfManagerFactory: {
      basic: '0x99B113c999eF3616737FBF83c1f18aeC27c6205e',
      vesting: '0x5009469A278Bcc572442c0144c07108156984176',
    },
    snapshotDistributorFactory: '0xB674FFEFB72462F2ED21097946fA7a442E34991A',
    deployerService: '0xeE8D5A0b8314d8559ab46df7F2487F6542cB70eb',
    queryService: '0x1966841C08a421D79fbaC626f0BFe26D0341A90F',
    nameRegistry: '0xAd935453430d43589e4A65281d348d8b625fe0BB',
    defaultWalletApprover: '0xaE88C599DA07c186Ae575A336c92b1F20E64A9f9',
    defaultStableCoin: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    childChainManager: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
  },
  venlyConfig: {
    secretType: SecretType.MATIC,
    env: 'prod',
  },
  ramp: {
    swapAsset: 'MATIC_USDC',
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
      basic: '0xE0776c364b1050789ba25ff8E508Be7C796d6974',
      vesting: '0xd1b57efEC963E71A7E737E9Ea58a079a6C258381',
    },
    snapshotDistributorFactory: '0x13B7A1eaEba77B2c8C44b56bdE2863c4efDa8dd8',
    deployerService: '0x9132e92e6fc8E192f72087D8856014566C43145f',
    queryService: '0x74D23A2FCe2A70313b444aE51816a70061C7786A',
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
    url: 'https://ri-widget-staging.firebaseapp.com/',
  },
}

export const GoerliNetwork: Network = {
  chainID: ChainID.GOERLI_TESTNET,
  name: 'Goerli (Ethereum Testnet)',
  shortName: 'goerli',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://goerli-light.eth.linkpool.io/'],
  explorerURLs: ['https://goerli.etherscan.io/'],
  tokenizerConfig: {
    apxRegistry: '0x95e1F87B3E5EC566CC0676DED8Ce992cE0E51Ed7',
    issuerFactory: {
      basic: '0x043974EED6624b4a361a6462445041cC9965C94E',
    },
    assetFactory: {
      basic: '0xD9dAc1e7d38699333619FC3AD4514653AfC15e82',
      transferable: '0x0d2FaB8Fae25E3e4e37d89fc08bC6BDB404db76d',
      simple: '0x6BC4Eb65F7675FD237B5BC45b97ac5D22FBa08c9',
    },
    cfManagerFactory: {
      basic: '0x6298FdED290229C970b2D8796E66EeaF4Ccd0bbd',
      vesting: '0xd4B31CFbDdd567A2052073bFCef1B879244f91d9',
    },
    snapshotDistributorFactory: '0x3B9b7855c7D5269171458C9732E02F49F2480a29',
    deployerService: '0x596E2F22cE6A75EF75Ed19e694aCfBa96140959f',
    queryService: '0x5A22bc3a5078801CB0e8B5C61bb8361D16C8Ed73',
    nameRegistry: '0x41b90C4C84f6388c29835CBA03Cd50D92fB24e8E',
    defaultWalletApprover: '0x893152e259BdDEa9D42f935f38d7c2c88431c748',
    defaultStableCoin: '0x7A6E8B47ab83cA0374ef6D59a0B0459BCB5c0510', // custom stablecoin issued by filip
    childChainManager: '0xb5505a6d998549090530911180f38aC5130101c6',
  },
}

export const Networks: { [key in ChainID]: Network } = {
  [ChainID.MATIC_MAINNET]: MaticNetwork,
  [ChainID.MUMBAI_TESTNET]: MumbaiNetwork,
  [ChainID.GOERLI_TESTNET]: GoerliNetwork,
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
