import {environment as baseEnvironment} from './env.base'
import {PostBuildEnv, PreBuildEnv} from '../../types/env'

const preBuildEnv = process.env as unknown as PreBuildEnv
const postBuildEnv = (window as any).env as PostBuildEnv

export const environment = {
  ...baseEnvironment,
  production: true,
  backendURL: postBuildEnv?.BACKEND_URL || 'https://invest-api.ampnet.io',
}
