import {Injectable} from '@angular/core'
import {ChainID} from '../networks'
import {PreferenceQuery} from '../../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class TokenMappingService {
  constructor(private preferenceQuery: PreferenceQuery) {
  }

  get matic() {
    return maticMapping[this.preferenceQuery.getValue().chainID]
  }

  get usdc() {
    return usdcMapping[this.preferenceQuery.getValue().chainID]
  }
}

const maticMapping: TokenMapping = {
  [ChainID.MATIC_MAINNET]: '0x0000000000000000000000000000000000001010',
  [ChainID.MUMBAI_TESTNET]: '0x0000000000000000000000000000000000001010',
}

const usdcMapping: TokenMapping = {
  [ChainID.MATIC_MAINNET]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  [ChainID.MUMBAI_TESTNET]: '',
}

type TokenMapping = { [key in ChainID]: string }
