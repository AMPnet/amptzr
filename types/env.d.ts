declare var process: Process

interface Process {
  // prebuild-time env variables
  env: PreBuildEnv
}

interface PreBuildEnv {
  COMMIT_HASH: string
  APP_VERSION: string
  PRERENDER_API_KEY: string
}

export interface Window {
  // postbuild-time env variables, loaded on start-up
  env: PostBuildEnv
}

interface PostBuildEnv {
  IPFS_API_URL: string
  IPFS_GATEWAY_URL: string
  IPFS_PINATA_API_URL: string
  BACKEND_URL: string
  FIXED_CHAIN_ID: string
  FIXED_ISSUER: string
}
