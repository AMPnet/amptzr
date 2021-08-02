import {PostBuildEnv, PreBuildEnv} from '../../types/env'

const preBuildEnv = process.env as unknown as PreBuildEnv
const postBuildEnv = (window as any).env as PostBuildEnv
export const environment = {
  production: false,
  commitHash: preBuildEnv.COMMIT_HASH,
  appVersion: preBuildEnv.APP_VERSION,
  arkane: {
    clientID: postBuildEnv?.ARKANE_ID || 'AMPnet',
    env: postBuildEnv?.ARKANE_ENV || 'prod',
  },
  fixedChainID: postBuildEnv?.FIXED_CHAIN_ID,
  ipfs: {
    apiURL: postBuildEnv?.IPFS_API_URL || 'https://ipfs.infura.io:5001',
    gatewayURL: postBuildEnv?.IPFS_API_URL || 'https://gateway.pinata.cloud',
    pinataApiURL: postBuildEnv?.IPFS_PINATA_API_URL || 'https://api.pinata.cloud',
  },
  backendURL: postBuildEnv?.BACKEND_URL || 'https://eth-staging.ampnet.io',
}
