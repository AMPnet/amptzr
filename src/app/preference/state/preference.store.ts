import { Injectable } from '@angular/core'
import { Store, StoreConfig } from '@datorama/akita'
import { ChainID, MaticNetwork } from '../../shared/networks'
import { environment } from '../../../environments/environment'
import { IssuerFlavor } from '../../shared/services/blockchain/flavors'

export interface PreferenceState {
  address: string
  authProvider: AuthProvider | ''
  JWTAccessToken: string
  JWTRefreshToken: string
  chainID: ChainID
  apiKey: string
  projectID: string,
  issuer: {
    address: string
    flavor: IssuerFlavor
    slug?: string
  }
}

export function createInitialState(): PreferenceState {
  return {
    address: '',
    authProvider: '',
    JWTAccessToken: '',
    JWTRefreshToken: '',
    apiKey: '',
    projectID: '',
    chainID: environment.fixed.chainID || MaticNetwork.chainID,
    issuer: {
      address: environment.fixed.issuer || '',
      flavor: IssuerFlavor.BASIC,
    },
  }
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'preference' })
export class PreferenceStore extends Store<PreferenceState> {
  constructor() {
    super(createInitialState())
  }
}

export enum AuthProvider {
  METAMASK = 'METAMASK',
  MAGIC = 'MAGIC',
  WALLET_CONNECT = 'WALLET_CONNECT',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
}
