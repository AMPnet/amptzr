declare var process: Process

interface Process {
  // prebuild-time env variables
  env: PreBuildEnv;
}

interface PreBuildEnv {
  COMMIT_HASH: string
}

export interface Window {
  // postbuild-time env variables, loaded on start-up
  env: PostBuildEnv
}

interface PostBuildEnv {
  ARKANE_ID: string
  ARKANE_ENV: string
  FIXED_CHAIN_ID: string
}
