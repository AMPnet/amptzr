import { PostBuildEnv, PreBuildEnv } from '../../types/env'
import { getClientByHostname } from '../app/shared/hostnames'
import { getWindow } from '../app/shared/utils/browser'

const preBuildEnv = process.env as unknown as PreBuildEnv
const postBuildEnv = getWindow().env as PostBuildEnv

export const environment = {
  production: false,
  commitHash: preBuildEnv.COMMIT_HASH,
  appVersion: preBuildEnv.APP_VERSION,
  ipfs: {
    apiURL: postBuildEnv?.IPFS_API_URL || 'https://ipfs.infura.io:5001',
    gatewayURL: postBuildEnv?.IPFS_API_URL || 'https://ampnet.mypinata.cloud',
    pinataApiURL:
      postBuildEnv?.IPFS_PINATA_API_URL || 'https://api.pinata.cloud',
  },
  backendURL: postBuildEnv?.BACKEND_URL || 'https://eth-staging.ampnet.io',
  fixed: {
    chainID:
      getClientByHostname()?.network.chainID ||
      (postBuildEnv?.FIXED_CHAIN_ID
        ? Number(postBuildEnv?.FIXED_CHAIN_ID)
        : undefined),
    issuer:
      getClientByHostname()?.issuerAddress ||
      (postBuildEnv?.FIXED_ISSUER ?? undefined),
  },
  prerenderApiKey: preBuildEnv?.PRERENDER_API_KEY || '',
}
