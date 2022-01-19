import {providers, utils} from 'ethers'
import {ReconnectingWebsocketProvider} from './ethersjs/reconnecting-websocket-provider'

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
  maxGasPrice: 100,
  rpcURLs: ['https://polygon-rpc.com'],
  wssRpcURLs: [
    'wss://polygon-mainnet.g.alchemy.com/v2/A8PZz3PJWwX_yQAW5q0JjqaNPPshI9Qg',
    'wss://ws-matic-mainnet.chainstacklabs.com',
  ],
  explorerURLs: ['https://polygonscan.com/'],
  tokenizerConfig: {
    apxRegistry: '0xd355adCdf57B39e7751A688158515CE862F14e23',
    issuerFactory: {
      basic: '0x9DFC2e793a3e88ae61766aaC24F7167501953dC9',
    },
    assetFactory: {
      basic: '0x7530569e6669a06110f62E2ab39E3B0653Bd885E',
      transferable: '0x0d7E2e171C63f913901467D980C357c9D8ACbeb6',
      simple: '0x06f5A8a5086453efeE31B0299AD4044E63669340',
    },
    cfManagerFactory: {
      basic: '0x823991e528e1caa7C13369A2860a162479906C90',
      vesting: '0xB853E8B0DC7542391F095070A75af57e3F0427Be',
    },
    queryService: '0x00d3759D4B7C4163e987E10eb46d0Ae2771B40B5',
    nameRegistry: '0xeB186b3C94e66e0f1CFe525D9187fb6933e8c91A',
    feeManager: '0x7c6912280D9c28e42c208bE79ccb2c8fC71Bd7EA',
    defaultWalletApprover: '0xeD249D3b3cfe53f0FA655f8814Baff404AA0B27c',
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
    apxRegistry: '0x93148Bd574232Acae13B12d6A3a1843109f5243b',
    issuerFactory: {
      basic: '0x463d65eba0efa397ad5d7Fa49f335DC44F124d03',
    },
    assetFactory: {
      basic: '0x45f036A8FD250F00E7732A1516Ba7342B1A66915',
      transferable: '0x2a977180D3694F952fA240734B171f7c241Db37f',
      simple: '0x9d94eBdCd676B25EdABbaadf343140bf1Bf60e36',
    },
    cfManagerFactory: {
      basic: '0x5b14f62551FA82B8AeD78A72c8C483DAD5727C86',
      vesting: '0xe1284684E0f30089b114DFC141Ada9843c155f3f',
    },
    queryService: '0xBF98A3d8D66CdC80Aa964296AAe7aD13905BC506',
    nameRegistry: '0x5771E32E4aC5Db8b06DfAD4774E2a5358cc90FF5',
    feeManager: '0xC74f47030aedEBa155a65921E62e8B3C0Bf77140',
    defaultWalletApprover: '0x9D320608c28ecB79daE1c9E778A75040eC7F7d79',
    defaultStableCoin: '0x9733aa0fb74a01f058fbeb0ad9da3f483058908e',
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

/**
 * Interface from wallet_addEthereumChain response.
 * Source: https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
 * Last date accessed: 20211227
 */
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
