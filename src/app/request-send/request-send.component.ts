import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, combineLatest, concatMap, from, Observable, of} from 'rxjs'
import {switchMapTap, withStatus, WithStatus} from '../shared/utils/observables'
import {FormBuilder, FormGroup} from '@angular/forms'
import {BigNumber, constants} from 'ethers'
import {AssetService, CommonAssetWithInfo} from '../shared/services/blockchain/asset/asset.service'
import {SessionQuery} from '../session/state/session.query'
import {PreferenceQuery} from '../preference/state/preference.query'
import {SignerService} from '../shared/services/signer.service'
import {Erc20Service, ERC20TokenData} from '../shared/services/blockchain/erc20.service'
import {ConversionService} from '../shared/services/conversion.service'
import {DialogService} from '../shared/services/dialog.service'
import {GasService} from '../shared/services/blockchain/gas.service'
import {ErrorService} from '../shared/services/error.service'
import {RouterService} from '../shared/services/router.service'
import {ActivatedRoute} from '@angular/router'
import {catchError, distinctUntilChanged, map, shareReplay, switchMap, tap} from 'rxjs/operators'
import {ERC20__factory} from '../../../types/ethers-contracts'
import {RequestSend, RequestSendService} from './request-send.service'
import {Network} from '../shared/networks'

@Component({
  selector: 'app-request-send',
  templateUrl: './request-send.component.html',
  styleUrls: ['./request-send.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestSendComponent {
  refreshRequestSend = new BehaviorSubject<void>(undefined)

  state$!: Observable<RequestSendState>
  stateWithStatus$!: Observable<WithStatus<RequestSendState>>

  isUserLoggedIn$ = this.sessionQuery.isLoggedIn$
  shouldTransfer$: Observable<boolean>

  transferForm: FormGroup

  bigNumberConstants = constants

  constructor(private fb: FormBuilder,
              private assetService: AssetService,
              private requestSendService: RequestSendService,
              private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private signerService: SignerService,
              private erc20Service: Erc20Service,
              private conversion: ConversionService,
              private dialogService: DialogService,
              private gasService: GasService,
              private errorService: ErrorService,
              private router: RouterService,
              private route: ActivatedRoute) {
    const requestSendID = this.route.snapshot.params.id

    this.transferForm = this.fb.group({
      tokenAmount: [{value: '', disabled: true}],
      recipientAddress: [{value: '', disabled: true}],
    })

    const tokenBalance$ = (tokenAddress: string): Observable<BigNumber | undefined> => {
      return this.preferenceQuery.address$.pipe(
        switchMap(address => !!address ?
          this.erc20Service.tokenBalance$(tokenAddress) :
          of(undefined),
        ),
      )
    }

    this.state$ = this.refreshRequestSend.asObservable().pipe(
      switchMap(() => requestSendService.getRequest(requestSendID)),
      switchMap(requestSend => combineLatest([
        of(requestSend),
        this.erc20Service.getData(requestSend.token_address),
        tokenBalance$(requestSend.token_address),
        this.preferenceQuery.network$,
        this.assetService.getAssetWithInfo(requestSend.token_address, true).pipe(
          catchError(() => of(undefined)),
        ),
      ])),
      map(([requestSend, tokenData, balance, network, asset]) => ({
        requestSend, tokenData, balance, network, asset,
      })),
      distinctUntilChanged((p, c) => JSON.stringify(p) === JSON.stringify(c)),
      tap(state => {
        this.transferForm.patchValue({
          tokenAmount: this.conversion.parseToken(
            BigNumber.from(state.requestSend.amount), state.tokenData.decimals,
          ).replace(/(\.0$)/, ''),
          recipientAddress: state.requestSend.to_address,
        })
      }),
      shareReplay(1),
    )
    this.stateWithStatus$ = withStatus(this.state$)

    this.shouldTransfer$ = combineLatest([
      this.isUserLoggedIn$,
    ]).pipe(
      map(([isUserLoggedIn]) => isUserLoggedIn),
      distinctUntilChanged(),
    )
  }

  transfer(state: RequestSendState) {
    return () => {
      return this.signerService.ensureAuth.pipe(
        map(signer => ERC20__factory.connect(state.tokenData.address, signer)),
        switchMap(contract => this.dialogService.waitingApproval(
          combineLatest([of(contract), this.gasService.overrides]).pipe(
            concatMap(([contract, overrides]) => {
              const tokenAmount = this.conversion.toToken(
                state.requestSend.amount, state.tokenData.decimals,
              )

              return contract.populateTransaction.transfer(
                state.requestSend.to_address, tokenAmount.toString(), overrides,
              )
            }),
            map(tx => {
              tx.data = state.requestSend.send_tx.data
              return tx
            }),
            switchMap(tx => this.signerService.sendTransaction(tx)),
          ),
        )),
        switchMap(tx => this.dialogService.waitingTransaction(
          from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        )),
        this.errorService.handleError(),
        switchMapTap(tx => this.requestSendService.updateRequest(state.requestSend.id, {
          tx_hash: tx.transactionHash,
        })),
        switchMap(() => this.dialogService.success({
          message: 'Transfer done.',
        })),
        tap(() => this.refreshRequestSend.next()),
      )
    }
  }

  login(): Observable<unknown> {
    return this.signerService.ensureAuth
  }
}

interface RequestSendState {
  requestSend: RequestSend,
  tokenData: ERC20TokenData
  balance: BigNumber | undefined,
  network: Network,
  asset?: CommonAssetWithInfo,
}
