import { environment as baseEnvironment } from './env.base'
import { PostBuildEnv, PreBuildEnv } from '../../types/env'
import { getWindow } from '../app/shared/utils/browser'

const preBuildEnv = process.env as unknown as PreBuildEnv
const postBuildEnv = getWindow().env as PostBuildEnv

export const environment = {
  ...baseEnvironment,
  production: true,
  backendURL: postBuildEnv?.BACKEND_URL || 'https://invest-api.ampnet.io',
}
