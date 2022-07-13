import { Injectable } from '@angular/core'
import {
  PayoutService as ContractPayoutService,
  PayoutService__factory,
} from '../../../../../types/ethers-contracts'
import { SessionQuery } from '../../../session/state/session.query'
import { map, switchMap } from 'rxjs/operators'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { GasService } from './gas.service'
import { DialogService } from '../dialog.service'
import { SignerService } from '../signer.service'
import { ErrorService } from '../error.service'
import { BigNumber, Signer } from 'ethers'
import { Provider } from '@ethersproject/providers'

@Injectable({
  providedIn: 'root',
})
export class PayoutService {
  constructor(
    private sessionQuery: SessionQuery,
    private gasService: GasService,
    private dialogService: DialogService,
    private signerService: SignerService,
    private errorService: ErrorService,
    private preferenceQuery: PreferenceQuery
  ) {}

  contract(signerOrProvider: Signer | Provider): ContractPayoutService {
    return PayoutService__factory.connect(
      this.preferenceQuery.network.tokenizerConfig.payoutService,
      signerOrProvider
    )
  }

  getPayoutFeeForAssetAndAmount(asset: string, amount: BigNumber) {
    return this.sessionQuery.provider$.pipe(
      map((provider) => this.contract(provider)),
      switchMap((contract) =>
        contract.getPayoutFeeForAssetAndAmount(
          asset,
          amount,
          this.preferenceQuery.network.tokenizerConfig.payoutManager
        )
      )
    )
  }
}
