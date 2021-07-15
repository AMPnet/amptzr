import {Window} from '../../types/env'

const windowEnv = (window as unknown as Window)?.env
export const environment = {
  production: true,
  arkane: {
    clientID: windowEnv?.ARKANE_ID || 'AMPnet',
    env: windowEnv?.ARKANE_ENV || 'prod',
  },
  fixedChainID: windowEnv?.FIXED_CHAIN_ID,
}
