import {Injectable} from '@angular/core'
import {BehaviorSubject, combineLatest, from, merge, Observable, of} from 'rxjs'
import {filter, map, switchMap, tap} from 'rxjs/operators'
import {ERC20__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {IssuerService} from './issuer.service'
import {BigNumber, BigNumberish, utils} from 'ethers'
import {SignerService} from '../signer.service'
import {contractEvent} from '../../utils/ethersjs'
import {DialogService} from '../dialog.service'

@Injectable({
  providedIn: 'root',
})
export class StablecoinService {
  contract$ = combineLatest([
    this.preferenceQuery.issuer$,
    this.sessionQuery.provider$,
  ]).pipe(
    switchMap(([issuer, provider]) => this.issuerService.getState(issuer.address, provider).pipe(
      map(state => ERC20__factory.connect(state.stablecoin, provider)),
    )),
  )

  private precisionSub = new BehaviorSubject<number>(18)
  private symbolSub = new BehaviorSubject<string>('$')

  balance$: Observable<BigNumber> = combineLatest([
    this.contract$,
    this.sessionQuery.address$,
  ]).pipe(
    filter(([_contract, address]) => !!address),
    switchMap(([contract, address]) => merge(
      of(undefined),
      contractEvent(contract, contract.filters.Transfer(address!)),
      contractEvent(contract, contract.filters.Transfer(null, address!)),
    ).pipe(
      switchMap(() => contract.balanceOf(address!)),
    )),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private signerService: SignerService,
              private dialogService: DialogService,
              private issuerService: IssuerService) {
    this.contract$.pipe(
      switchMap(contract => combineLatest([contract.decimals(), contract.symbol()])),
      tap(([decimals, symbol]) => {
        this.precisionSub.next(decimals)
        this.symbolSub.next(symbol)
      }),
    ).subscribe()
  }

  get precision() {
    return this.precisionSub.value
  }

  get symbol() {
    return this.symbolSub.value
  }

  format(wei: BigNumberish) {
    return Number(utils.formatUnits(wei, this.precision))
  }

  parse(amount: string | number) {
    return utils.parseUnits(String(amount), this.precision)
  }

  getAllowance(campaignAddress: string): Observable<number> {
    return combineLatest([
      this.contract$,
      this.signerService.ensureAuth,
    ]).pipe(
      switchMap(([contract, _signer]) =>
        contract.allowance(this.sessionQuery.getValue().address!, campaignAddress)),
      map(res => this.format(res)),
    )
  }

  approveAmount(campaignAddress: string, amount: number): Observable<unknown> {
    return combineLatest([
      this.contract$,
      this.signerService.ensureAuth,
    ]).pipe(
      map(([contract, signer]) => contract.connect(signer)),
      switchMap(contract => contract.approve(campaignAddress, this.parse(amount))),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
    )
  }
}
