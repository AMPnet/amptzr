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
    apiURL: postBuildEnv?.IPFS_API_URL || 'http://localhost:5001',
    gatewayURL: postBuildEnv?.IPFS_API_URL || 'http://localhost:8080',
  },
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
