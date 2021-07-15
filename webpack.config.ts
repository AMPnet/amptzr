import * as webpack from 'webpack'
import {PreBuildEnv} from './types/env'

export default {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': ({
        COMMIT_HASH: JSON.stringify(process.env.COMMIT_HASH),
        APP_VERSION: JSON.stringify(process.env.APP_VERSION),
      }) as PreBuildEnv as Record<string, any>,
    }),
  ],
} as webpack.Configuration
