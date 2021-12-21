import {Injectable} from '@angular/core'
import {BehaviorSubject, combineLatest, from, merge, Observable, of} from 'rxjs'
import {distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators'
import {ERC20__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {BigNumber} from 'ethers'
import {SignerService} from '../signer.service'
import {contractEvent} from '../../utils/ethersjs'
import {DialogService} from '../dialog.service'
import {parseUnits} from 'ethers/lib/utils'
import {GasService} from './gas.service'
import {IssuerService} from './issuer/issuer.service'
import {NameService} from './name.service'
import {IssuerFlavor} from './flavors'

@Injectable({
  providedIn: 'root',
})
export class StablecoinService {
  contract$ = combineLatest([
    this.preferenceQuery.issuer$.pipe(switchMap(issuer => this.nameService.getIssuer(issuer.address))),
    this.sessionQuery.provider$,
  ]).pipe(
    distinctUntilChanged(),
    switchMap(([issuer, provider]) => this.issuerService.getState(
      issuer.issuer.contractAddress, issuer.issuer.flavor as IssuerFlavor,
    ).pipe(
      map(issuer => ERC20__factory.connect(issuer.stablecoin, provider)),
    )),
    switchMap(contract => of(contract).pipe(
      switchMap(contract => combineLatest([contract.decimals(), contract.symbol()])),
      tap(([decimals, symbol]) => {
        this.precisionSub.next(decimals)
        this.symbolSub.next(symbol)
      }),
      map(() => contract),
    )),
  )

  // TODO: set default to 18 digits when screens for managing
  //  will be finished.
  private precisionSub = new BehaviorSubject<number>(6)
  private symbolSub = new BehaviorSubject<string>('$')

  balance$: Observable<BigNumber | undefined> = combineLatest([
    this.contract$,
    this.sessionQuery.address$,
  ]).pipe(
    switchMap(([contract, address]) => !address ? of(undefined) : merge(
      of(undefined),
      contractEvent(contract, contract.filters.Transfer(address)),
      contractEvent(contract, contract.filters.Transfer(null, address)),
    ).pipe(
      switchMap(() => contract.balanceOf(address)),
    )),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private nameService: NameService,
              private signerService: SignerService,
              private dialogService: DialogService,
              private gasService: GasService,
              private issuerService: IssuerService) {
  }

  get address() {
    return this.preferenceQuery.network.tokenizerConfig.defaultStableCoin
  }

  get precision() {
    return this.precisionSub.value
  }

  get symbol() {
    return this.symbolSub.value
  }

  parse(amount: string | number, precision?: number) {
    const decimals = precision ?? this.precision
    const roundedAmount = Math.round(Number(amount) * 10 ** decimals) / 10 ** decimals
    return parseUnits(String(roundedAmount), precision ?? this.precision)
  }

  getAllowance(campaignAddress: string): Observable<StablecoinBigNumber> {
    return combineLatest([
      this.contract$,
      this.signerService.ensureAuth,
    ]).pipe(
      switchMap(([contract, _signer]) =>
        contract.allowance(this.sessionQuery.getValue().address!, campaignAddress)),
    )
  }

  approveAmount(campaignAddress: string, amount: number): Observable<unknown> {
    return combineLatest([
      this.contract$,
      this.signerService.ensureAuth,
    ]).pipe(
      map(([contract, signer]) => contract.connect(signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) =>
        contract.populateTransaction.approve(campaignAddress, this.parse(amount), overrides),
      ),
      switchMap(tx => this.signerService.sendTransaction(tx)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
    )
  }
}

/**
 * StablecoinBigNumber is a regular BigNumber, but scaled to stablecoin format.
 */
export type StablecoinBigNumber = BigNumber
