import { providers } from 'ethers'
import {
  Matic as TPMatic,
  Mumbai as TPMumbai,
} from '../../../tokenizer-prototype/deployments'
import ReconnectingWebSocket from 'reconnecting-websocket'

export enum ChainID {
  MATIC_MAINNET = 137, // Polygon
  MUMBAI_TESTNET = 80001, // Polygon
  AURORA_MAINNET = 1313161554,
  GOERLI_TESTNET = 5,
  OPTIMISM = 10,
  ARBITRUM = 42161,
  AVALANCHE = 43114
}

export interface Network {
  chainID: ChainID
  name: string
  shortName: string
  nativeCurrency: {
    name: string
    symbol: string
  }
  maxGasPrice: number
  rpcURLs: string[]
  wssRpcURLs?: string[]
  explorerURLs: string[]
  tokenizerConfig: TokenizerConfig
  ramp?: RampConfig
}

interface TokenizerConfig {
  apxRegistry: string
  issuerFactory: {
    basic: string
  }
  assetFactory: {
    basic: string
    transferable: string
    simple: string
  }
  cfManagerFactory: {
    basic: string
    vesting: string
  }
  queryService: string
  payoutService: string
  payoutManager: string
  nameRegistry: string
  campaignFeeManager: string
  defaultWalletApprover: string
  defaultStableCoin: string
}

interface RampConfig {
  swapAsset: string
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
    'https://nd-159-625-174.p2pify.com/db285116493a92ba6e91417f43a942bd',
    'https://polygon-rpc.com',
  ],
  wssRpcURLs: [
    'wss://ws-nd-159-625-174.p2pify.com/db285116493a92ba6e91417f43a942bd',
    'wss://ws-matic-mainnet.chainstacklabs.com',
    'wss://polygon-mainnet.g.alchemy.com/v2/A8PZz3PJWwX_yQAW5q0JjqaNPPshI9Qg',
  ],
  explorerURLs: ['https://polygonscan.com/'],
  tokenizerConfig: {
    apxRegistry: TPMatic.apxRegistry.address,
    issuerFactory: TPMatic.issuerFactory,
    assetFactory: TPMatic.assetFactory,
    cfManagerFactory: TPMatic.cfManagerFactory,
    queryService: TPMatic.queryService,
    payoutService: TPMatic.payoutService,
    payoutManager: TPMatic.payoutManager,
    nameRegistry: TPMatic.nameRegistry.address,
    campaignFeeManager: TPMatic.campaignFeeManager.address,
    defaultWalletApprover: TPMatic.walletApproverService.address,
    defaultStableCoin: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  ramp: {
    swapAsset: 'MATIC',
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
  wssRpcURLs: [
    'wss://ws-nd-673-584-255.p2pify.com/6eba79da2c02fb3ca5985cc6e95ebd53',
    'wss://polygon-mumbai.g.alchemy.com/v2/w8tKRA88CQYBQEwGO2HlKKHtSD_qHOoU',
    'wss://ws-matic-mumbai.chainstacklabs.com',
  ],
  explorerURLs: ['https://mumbai.polygonscan.com/'],
  tokenizerConfig: {
    apxRegistry: TPMumbai.apxRegistry.address,
    issuerFactory: TPMumbai.issuerFactory,
    assetFactory: TPMumbai.assetFactory,
    cfManagerFactory: TPMumbai.cfManagerFactory,
    queryService: TPMumbai.queryService,
    payoutService: TPMumbai.payoutService,
    payoutManager: TPMumbai.payoutManager,
    nameRegistry: TPMumbai.nameRegistry.address,
    campaignFeeManager: TPMumbai.campaignFeeManager.address,
    defaultWalletApprover: TPMumbai.walletApproverService.address,
    defaultStableCoin: '0x1eDaD4f5Dac6f2B97E7F6e5D3fF5f04D666685c3',
  },
  ramp: {
    swapAsset: 'MATIC',
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
    payoutService: '',
    payoutManager: '',
    nameRegistry: '0x41b90C4C84f6388c29835CBA03Cd50D92fB24e8E',
    campaignFeeManager: '',
    defaultWalletApprover: '0x893152e259BdDEa9D42f935f38d7c2c88431c748',
    defaultStableCoin: '0x7A6E8B47ab83cA0374ef6D59a0B0459BCB5c0510', // custom stablecoin issued by filip
  },
}

export const AuroraNetwork: Network = {
  chainID: ChainID.AURORA_MAINNET,
  name: 'Aurora (on NEAR)',
  shortName: 'aurora',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://mainnet.aurora.dev'],
  wssRpcURLs: ['wss://mainnet.aurora.dev'],
  explorerURLs: ['https://aurorascan.dev/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    payoutService: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    payoutManager: '0x041e15aF5ecBc0C93F106B2F6a7F5fFa847eF9e4',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    defaultStableCoin: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802', // custom stablecoin issued by filip
  },
}

export const AvalancheNetwork: Network = {
  chainID: ChainID.AVALANCHE,
  name: 'Avalanche Network',
  shortName: 'avalanche',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://api.avax.network/ext/bc/C/rpc'],
  wssRpcURLs: [''],
  explorerURLs: ['https://snowtrace.io/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x459464B13A89F65E01291944f72E6842ad0Cbe34',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0x0B3038562aCb5715254734E77C5Cb4064070Ab1f',
    payoutService: '0x713D963569DC7157DE0C1D1815679c4f3A30e078',
    payoutManager: '0x71Af6221c6AdE382a872B7A7B1B8068688E16ae5',
    nameRegistry: '0xaCeC98CD043f3b84F3272Bbc55A4d7A0dC8A0175',
    campaignFeeManager: '',
    defaultWalletApprover: '0x5C5c3a6DD68953B6d77413B88329174Ce03a75Bc',
    defaultStableCoin: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // custom stablecoin issued by filip
  },
}

export const OptimismNetwork: Network = {
  chainID: ChainID.OPTIMISM,
  name: 'Optimistic Ethereum',
  shortName: 'optimism',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://weathered-white-lambo.optimism.quiknode.pro/651498cb8884a1093894a149d1d44004a45fb5a6/'],
  wssRpcURLs: ['wss://weathered-white-lambo.optimism.quiknode.pro/651498cb8884a1093894a149d1d44004a45fb5a6/'],
  explorerURLs: ['https://optimistic.etherscan.io/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0xCaf30A0B45B8E9A5f7310274f0FAec83cF307936',
    payoutService: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    payoutManager: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    defaultStableCoin: '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // custom stablecoin issued by filip
  },
}

export const ArbitrumNetwork: Network = {
  chainID: ChainID.ARBITRUM,
  name: 'Arbitrum One',
  shortName: 'arbitrum',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
  },
  maxGasPrice: 20,
  rpcURLs: [
    'https://weathered-bitter-panorama.arbitrum-mainnet.quiknode.pro/6263c3e3ab2a9c81efd17e687344d9d5d049de68'
  ],
  wssRpcURLs: [
    'wss://weathered-bitter-panorama.arbitrum-mainnet.quiknode.pro/6263c3e3ab2a9c81efd17e687344d9d5d049de68'
  ],
  explorerURLs: ['https://optimistic.etherscan.io/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0xCaf30A0B45B8E9A5f7310274f0FAec83cF307936',
    payoutService: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    payoutManager: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    defaultStableCoin: '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // custom stablecoin issued by filip
  },
}

export const Networks: { [key in ChainID]: Network } = {
  [ChainID.MATIC_MAINNET]: MaticNetwork,
  [ChainID.MUMBAI_TESTNET]: MumbaiNetwork,
  [ChainID.GOERLI_TESTNET]: GoerliNetwork,
  [ChainID.AURORA_MAINNET]: AuroraNetwork,
  [ChainID.OPTIMISM]: OptimismNetwork,
  [ChainID.ARBITRUM]: ArbitrumNetwork,
  [ChainID.AVALANCHE]: AvalancheNetwork
}

const getEthersNetwork = (network: Network): providers.Network => ({
  name: network.shortName,
  chainId: network.chainID,
  _defaultProvider: (_providers: any) => {
    if (network.wssRpcURLs?.[0]) {
      return new providers.WebSocketProvider(
        new ReconnectingWebSocket(network.wssRpcURLs![0]) as any,
        network.chainID
      )
    }

    return new providers.StaticJsonRpcProvider(
      network.rpcURLs[0],
      network.chainID
    )
  },
})

export const EthersNetworks = Object.fromEntries(
  Object.entries(Networks).map((entry) => [
    entry[0],
    getEthersNetwork(entry[1]),
  ])
)
