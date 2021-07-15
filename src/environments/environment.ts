import {Window} from '../../types/env'

const windowEnv = (window as unknown as Window)?.env
export const environment = {
  production: false,
  arkane: {
    clientID: windowEnv?.ARKANE_ID || 'AMPnet',
    env: windowEnv?.ARKANE_ENV || 'prod',
  },
  fixedChainID: windowEnv?.FIXED_CHAIN_ID,
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
