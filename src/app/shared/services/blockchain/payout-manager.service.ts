import {Injectable} from '@angular/core'
import {PayoutManager, PayoutManager__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {switchMap} from 'rxjs/operators'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {combineLatest, from, of} from 'rxjs'
import {GasService} from './gas.service'
import {DialogService} from '../dialog.service'
import {SignerService} from '../signer.service'
import {ErrorService} from '../error.service'
import {IPayoutManager} from '../../../../../types/ethers-contracts/PayoutManager'
import {Signer} from 'ethers'
import {Provider} from '@ethersproject/providers'

@Injectable({
  providedIn: 'root',
})
export class PayoutManagerService {
  constructor(private sessionQuery: SessionQuery,
              private gasService: GasService,
              private dialogService: DialogService,
              private signerService: SignerService,
              private errorService: ErrorService,
              private preferenceQuery: PreferenceQuery) {
  }

  contract(signerOrProvider: Signer | Provider): PayoutManager {
    return PayoutManager__factory.connect(
      this.preferenceQuery.network.tokenizerConfig.payoutManager, signerOrProvider,
    )
  }

  createPayout(data: IPayoutManager.CreatePayoutStruct) {
    return this.signerService.ensureAuth.pipe(
      switchMap(signer => this.dialogService.waitingApproval(
        of(this.contract(signer)).pipe(
          switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
          switchMap(([contract, overrides]) => contract.populateTransaction.createPayout(data, overrides)),
          switchMap(tx => this.signerService.sendTransaction(tx)),
        ),
      )),
      switchMap(tx => this.dialogService.waitingTransaction(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
      )),
      this.errorService.handleError(false, true),
    )
  }
}
