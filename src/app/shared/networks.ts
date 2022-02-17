import {providers} from 'ethers'
import {ReconnectingWebsocketProvider} from './ethersjs/reconnecting-websocket-provider'
import {Matic as TPMatic, Mumbai as TPMumbai} from '../../../tokenizer-prototype/deployments'

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
  wssRpcURLs?: string[],
  explorerURLs: string[],
  tokenizerConfig: TokenizerConfig,
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
  queryService: string,
  nameRegistry: string,
  feeManager: string,
  defaultWalletApprover: string,
  defaultStableCoin: string,
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
  maxGasPrice: 1500,
  rpcURLs: [
    'https://polygon-rpc.com',
  ],
  wssRpcURLs: [
    'wss://polygon-mainnet.g.alchemy.com/v2/A8PZz3PJWwX_yQAW5q0JjqaNPPshI9Qg',
    'wss://ws-matic-mainnet.chainstacklabs.com',
  ],
  explorerURLs: ['https://polygonscan.com/'],
  tokenizerConfig: {
    ...TPMatic,
    defaultWalletApprover: TPMatic.walletApproverService,
    defaultStableCoin: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
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
  rpcURLs: ['https://rpc-mumbai.maticvigil.com'],
  wssRpcURLs: [
    'wss://polygon-mumbai.g.alchemy.com/v2/w8tKRA88CQYBQEwGO2HlKKHtSD_qHOoU',
    'wss://ws-matic-mumbai.chainstacklabs.com',
  ],
  explorerURLs: ['https://mumbai.polygonscan.com/'],
  tokenizerConfig: {
    ...TPMumbai,
    defaultWalletApprover: TPMumbai.walletApproverService,
    defaultStableCoin: '0x1eDaD4f5Dac6f2B97E7F6e5D3fF5f04D666685c3',
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
  rpcURLs: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  explorerURLs: ['https://goerli.etherscan.io/'],
  tokenizerConfig: {
    apxRegistry: '0x95e1F87B3E5EC566CC0676DED8Ce992cE0E51Ed7',
    issuerFactory: {
      basic: '0x0361B0A1333A0BF88ce2c3a4d7192C5E8A5Efea9',
    },
    assetFactory: {
      basic: '0xE58FA32f73D0EeeaD05EFf3c769F596773D446c7',
      transferable: '0xB70E991eda75820Df751ddd90cC58a769f044c1d',
      simple: '0x0D4c488fA3339C3D68640964242252F7da3886FC',
    },
    cfManagerFactory: {
      basic: '0xa468ad0f01819D995191802A89148d268B04C750',
      vesting: '0x64F09Cc15d9359a68A75cfEB4711701160EA5178',
    },
    queryService: '0x5A22bc3a5078801CB0e8B5C61bb8361D16C8Ed73',
    nameRegistry: '0x41b90C4C84f6388c29835CBA03Cd50D92fB24e8E',
    feeManager: '',
    defaultWalletApprover: '0x893152e259BdDEa9D42f935f38d7c2c88431c748',
    defaultStableCoin: '0x7A6E8B47ab83cA0374ef6D59a0B0459BCB5c0510', // custom stablecoin issued by filip
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
  _defaultProvider: (_providers: any) => {
    if (network.wssRpcURLs?.[0]) {
      return new ReconnectingWebsocketProvider(network.wssRpcURLs![0], network.chainID)
    }

    return new providers.StaticJsonRpcProvider(network.rpcURLs[0], network.chainID)
  },
})

export const EthersNetworks = Object.fromEntries(Object.entries(Networks)
  .map((entry) => [entry[0], getEthersNetwork(entry[1])]),
)
