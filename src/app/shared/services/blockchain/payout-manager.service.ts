import { Injectable } from '@angular/core'
import {
  PayoutManager,
  PayoutManager__factory,
} from '../../../../../types/ethers-contracts'
import { SessionQuery } from '../../../session/state/session.query'
import { catchError, filter, map, switchMap } from 'rxjs/operators'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { combineLatest, EMPTY, from, Observable, of } from 'rxjs'
import { GasService } from './gas.service'
import { DialogService } from '../dialog.service'
import { SignerService } from '../signer.service'
import { ErrorService } from '../error.service'
import { IPayoutManager } from '../../../../../types/ethers-contracts/PayoutManager'
import { BigNumber, BigNumberish, BytesLike, Signer } from 'ethers'
import { Provider } from '@ethersproject/providers'
import { Structs } from '../../../../../types/ethers-contracts/IPayoutManager'

@Injectable({
  providedIn: 'root',
})
export class PayoutManagerService {
  payouts$: Observable<Payout[]> = combineLatest([
    this.sessionQuery.provider$.pipe(
      map((provider) => this.contract(provider))
    ),
    this.preferenceQuery.address$,
  ]).pipe(
    filter(([_contract, address]) => !!address),
    switchMap(([contract, address]) => contract.getPayoutsForOwner(address))
  )

  constructor(
    private sessionQuery: SessionQuery,
    private gasService: GasService,
    private dialogService: DialogService,
    private signerService: SignerService,
    private errorService: ErrorService,
    private preferenceQuery: PreferenceQuery
  ) {}

  contract(signerOrProvider: Signer | Provider): PayoutManager {
    return PayoutManager__factory.connect(
      this.preferenceQuery.network.tokenizerConfig.payoutManager,
      signerOrProvider
    )
  }

  getPayout(id: BigNumberish) {
    return this.sessionQuery.provider$.pipe(
      map((provider) => this.contract(provider)),
      switchMap((contract) => contract.getPayoutInfo(id))
    )
  }

  createPayout(data: IPayoutManager.CreatePayoutStruct) {
    return this.signerService.ensureAuth.pipe(
      switchMap((signer) =>
        this.dialogService.waitingApproval(
          of(this.contract(signer)).pipe(
            switchMap((contract) =>
              combineLatest([of(contract), this.gasService.overrides])
            ),
            switchMap(([contract, overrides]) =>
              contract.populateTransaction.createPayout(data, overrides)
            ),
            switchMap((tx) => this.signerService.sendTransaction(tx))
          )
        )
      ),
      switchMap((tx) =>
        this.dialogService.waitingTransaction(
          from(this.sessionQuery.provider.waitForTransaction(tx.hash))
        )
      ),
      this.errorService.handleError(false, true)
    )
  }

  cancelPayout(id: BigNumber) {
    return this.signerService.ensureAuth.pipe(
      switchMap((signer) =>
        this.dialogService.waitingApproval(
          of(this.contract(signer)).pipe(
            switchMap((contract) =>
              combineLatest([of(contract), this.gasService.overrides])
            ),
            switchMap(([contract, overrides]) =>
              contract.populateTransaction.cancelPayout(id, overrides)
            ),
            switchMap((tx) => this.signerService.sendTransaction(tx))
          )
        )
      ),
      switchMap((tx) =>
        this.dialogService.waitingTransaction(
          from(this.sessionQuery.provider.waitForTransaction(tx.hash))
        )
      ),
      this.errorService.handleError(false, true)
    )
  }

  claimPayout(data: ClaimData) {
    return this.signerService.ensureAuth.pipe(
      switchMap((signer) =>
        this.dialogService.waitingApproval(
          of(this.contract(signer)).pipe(
            switchMap((contract) =>
              combineLatest([of(contract), this.gasService.overrides])
            ),
            switchMap(([contract, overrides]) =>
              contract.populateTransaction.claim(
                data.payoutId,
                data.wallet,
                data.balance,
                data.proof,
                overrides
              )
            ),
            switchMap((tx) => this.signerService.sendTransaction(tx)),
            catchError(() => EMPTY)
          )
        )
      ),
      switchMap((tx) =>
        this.dialogService.waitingTransaction(
          from(this.sessionQuery.provider.waitForTransaction(tx.hash))
        )
      )
    )
  }
}

export type Payout = Structs.PayoutStructOutput

interface ClaimData {
  payoutId: BigNumberish
  wallet: string
  balance: BigNumberish
  proof: BytesLike[]
}
