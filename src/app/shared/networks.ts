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
    url?: string // URL is needed only for testing environments, Ramp uses production version when URL is not specified
  }
}

interface TokenizerConfig {
  issuerFactory: string,
  assetFactory: string,
  cfManagerFactory: string,
  payoutManagerFactory: string,
  deployerService: string,
  queryService: string,
  defaultWalletApprover: string,
  defaultIssuer: string,
  defaultStableCoin: string,
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
    issuerFactory: '0x0959b4eBf0Fe2D708C3DB22dc245a32a135Ef818',
    assetFactory: '0x46B01A62d03E2067bBfC6c88D2f2EEDC31cB75a9',
    cfManagerFactory: '0xA167Ac0C34C52a4a91a9c93618150b9ef508152C',
    payoutManagerFactory: '0x39d13eA4781F4FA57a347F5C49dD716048822F16',
    deployerService: '0x29aF1b53f2cb555B5621A9F13c24711A9EDdEC40',
    queryService: '0xF80a26Bf08AF7c8C33d6f8cFcFe9641363bA788b',
    defaultWalletApprover: '0x23B00A11F6DBbD3a850a0AE72668109133779575',
    defaultIssuer: '0xD17574450885C1b898bc835Ff9CB5b44A3601c24',
    defaultStableCoin: '0x18D71D80087084df631f95EF29C8a11904DC47F3',
  },
  venlyConfig: {
    secretType: SecretType.MATIC,
    env: 'prod',
  },
  ramp: {
    swapAsset: 'MATIC_USDC'
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
    issuerFactory: '0xb1EA65089c3525BC4F4287Ea83E0E594cDA00b30',
    assetFactory: '0xd72d91319E5ff36F34761B72a1e47e803Ce65743',
    cfManagerFactory: '0xa77d68e73752b4e4E6670032400f9a1Da522ed22',
    payoutManagerFactory: '0x39d13eA4781F4FA57a347F5C49dD716048822F16',
    deployerService: '0x9E4A2D67E1b63aB1C46000161c8288D5e4dea075',
    queryService: '0xF80a26Bf08AF7c8C33d6f8cFcFe9641363bA788b',
    defaultWalletApprover: '0x142f05565D9e0562e7caA09bAf816D263615dfe6',
    defaultIssuer: '0xD17574450885C1b898bc835Ff9CB5b44A3601c24',
    defaultStableCoin: '0x9733aa0fb74a01f058fbeb0ad9da3f483058908e',
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
