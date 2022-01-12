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
  snapshotDistributorFactory: string,
  deployerService: string,
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
    apxRegistry: '0x992EF576A79b7D3d05C31DfBCc389362F158c812',
    issuerFactory: {
      basic: '0x9E239Ce66eD4a8FDa607Ceeed0fC53d995dA8D35',
    },
    assetFactory: {
      basic: '0xfE628bCc1157ecf6E4E1A340A37d7320b8eB13f0',
      transferable: '0xf04BAE2Bc89205455DA1BBE75Ac0a4773D3Dd830',
      simple: '',
    },
    cfManagerFactory: {
      basic: '0xf10AA198C50f6f1E7665AD8d2735b8be4999B627',
      vesting: '',
    },
    snapshotDistributorFactory: '0xB674FFEFB72462F2ED21097946fA7a442E34991A',
    deployerService: '0x649cDE037774586763F4e6E13408C791e7e03276',
    queryService: '0x1966841C08a421D79fbaC626f0BFe26D0341A90F',
    nameRegistry: '0xA6c1924af6DbF73f2307FBCfaFB15d1DA0aebd95',
    feeManager: '0xc0163CD4587C1848a7418AfB1Adb16467fA858dC',
    defaultWalletApprover: '0xaE88C599DA07c186Ae575A336c92b1F20E64A9f9',
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
    snapshotDistributorFactory: '0xa8d6BA1f587562cE3C781B57B8BE9F1AF2D33161',
    deployerService: '0xEE5ac09500968b1b11AFEbfd9af64e50a734db37',
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
    snapshotDistributorFactory: '0x856Ad79217C52827f56748931FFcabc5c2F274aA',
    deployerService: '0x596E2F22cE6A75EF75Ed19e694aCfBa96140959f',
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
