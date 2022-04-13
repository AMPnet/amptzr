import {Injectable} from '@angular/core'
import {combineLatest, from, merge, Observable, of} from 'rxjs'
import {distinctUntilChanged, map, shareReplay, switchMap} from 'rxjs/operators'
import {ERC20__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {BigNumber, constants} from 'ethers'
import {contractEvent} from '../../utils/ethersjs'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {DialogService} from '../dialog.service'
import {GasService} from './gas.service'
import {SignerService} from '../signer.service'

@Injectable({
  providedIn: 'root',
})
export class Erc20Service {
  constructor(private sessionQuery: SessionQuery,
              private dialogService: DialogService,
              private gasService: GasService,
              private signerService: SignerService,
              private preferenceQuery: PreferenceQuery) {
  }

  getData(address: string): Observable<ERC20TokenData> {
    return this.sessionQuery.provider$.pipe(
      map(provider => ERC20__factory.connect(address, provider)),
      switchMap(contract => combineLatest([
        of(contract.address),
        from(contract.name()),
        from(contract.symbol()),
        from(contract.decimals()),
      ])),
      map(([address, name, symbol, decimals]) => ({
        address, name, symbol, decimals,
      })),
      distinctUntilChanged((p, c) => JSON.stringify(p) === JSON.stringify(c)),
      shareReplay(1),
    )
  }

  tokenBalance$(address: string): Observable<BigNumber | undefined> {
    return combineLatest([
      this.sessionQuery.provider$.pipe(
        map(provider => ERC20__factory.connect(address, provider)),
      ),
      this.preferenceQuery.address$,
    ]).pipe(
      switchMap(([contract, address]) => !address ? of(undefined) : merge(
        of(undefined),
        contractEvent(contract, contract.filters.Transfer(address)),
        contractEvent(contract, contract.filters.Transfer(null, address)),
      ).pipe(
        switchMap(() => contract.balanceOf(address)),
      )),
    )
  }

  getAllowance$(token: string, spender: string): Observable<BigNumber> {
    return combineLatest([
      this.sessionQuery.provider$.pipe(
        map(provider => ERC20__factory.connect(token, provider)),
      ),
      this.preferenceQuery.address$,
    ]).pipe(
      switchMap(([contract, address]) => !address ? of(constants.Zero) : merge(
        of(undefined),
        contractEvent(contract, contract.filters.Approval(address, spender)),
      ).pipe(
        switchMap(() => contract.allowance(address, spender)),
      )),
      shareReplay({bufferSize: 1, refCount: true}),
    )
  }

  approveAmount(token: string, spender: string, amount: BigNumber): Observable<unknown> {
    return combineLatest([
      this.signerService.ensureAuth,
    ]).pipe(
      switchMap(([signer]) => this.dialogService.waitingApproval(
        of(ERC20__factory.connect(token, signer)).pipe(
          switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
          switchMap(([contract, overrides]) =>
            contract.populateTransaction.approve(spender, amount, overrides),
          ),
          switchMap(tx => this.signerService.sendTransaction(tx)),
        ))),
      switchMap(tx => this.dialogService.waitingTransaction(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
      )),
    )
  }
}

export interface ERC20TokenData {
  address: string
  name: string
  symbol: string
  decimals: number
}
