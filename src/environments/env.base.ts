import {PostBuildEnv, PreBuildEnv} from '../../types/env'

const preBuildEnv = process.env as unknown as PreBuildEnv
const postBuildEnv = (window as any).env as PostBuildEnv

export const environment = {
  production: false,
  commitHash: preBuildEnv.COMMIT_HASH,
  appVersion: preBuildEnv.APP_VERSION,
  arkane: {
    clientID: postBuildEnv?.ARKANE_ID || 'AMPnet',
  },
  ipfs: {
    apiURL: postBuildEnv?.IPFS_API_URL || 'https://ipfs.infura.io:5001',
    gatewayURL: postBuildEnv?.IPFS_API_URL || 'https://ipfs.io',
    pinataApiURL: postBuildEnv?.IPFS_PINATA_API_URL || 'https://api.pinata.cloud',
  },
  backendURL: postBuildEnv?.BACKEND_URL || 'https://eth-staging.ampnet.io',
  fixed: {
    chainID: postBuildEnv?.FIXED_CHAIN_ID ? Number(postBuildEnv?.FIXED_CHAIN_ID) : undefined,
    // chainID: 80001,
    issuer: postBuildEnv?.FIXED_ISSUER ?? undefined,
    // issuer: '0x521B0200138CeF507769F6d8E8d4999F60B6b319',
  },
}
