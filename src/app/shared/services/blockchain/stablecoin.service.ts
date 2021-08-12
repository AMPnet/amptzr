import {Injectable} from '@angular/core'
import {combineLatest, merge, Observable, of} from 'rxjs'
import {filter, map, shareReplay, switchMap} from 'rxjs/operators'
import {ERC20__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {IssuerService} from './issuer.service'
import {BigNumber, utils} from 'ethers'
import {SignerService} from '../signer.service'
import {contractEvent} from '../../utils/ethersjs'

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

  symbol$ = this.contract$.pipe(
    switchMap(contract => contract.symbol()),
    shareReplay(1),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private signerService: SignerService,
              private issuerService: IssuerService) {
  }

  getAllowance(campaignAddress: string): Observable<number> {
    return combineLatest([
      this.contract$,
      this.signerService.ensureAuth,
    ]).pipe(
      switchMap(([contract, _signer]) =>
        contract.allowance(this.sessionQuery.getValue().address!, campaignAddress)),
      map(res => Number(utils.formatEther(res))),
    )
  }

  approveAmount(campaignAddress: string, amount: number): Observable<unknown> {
    return combineLatest([
      this.contract$,
      this.signerService.ensureAuth,
    ]).pipe(
      map(([contract, signer]) => contract.connect(signer)),
      switchMap(contract => contract.approve(campaignAddress, utils.parseEther(amount.toString()))),
      switchMap(tx => this.sessionQuery.provider.waitForTransaction(tx.hash)),
    )
  }
}
