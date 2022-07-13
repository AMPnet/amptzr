import { ChangeDetectionStrategy, Component, ɵmarkDirty } from '@angular/core'
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  from,
  Observable,
  of,
} from 'rxjs'
import {
  switchMapTap,
  withStatus,
  WithStatus,
} from '../../shared/utils/observables'
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { BigNumber, constants } from 'ethers'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../../shared/services/blockchain/asset/asset.service'
import {
  RequestSend,
  RequestSendService,
  AssetType,
} from '../request-send.service'
import { SessionQuery } from '../../session/state/session.query'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { SignerService } from '../../shared/services/signer.service'
import {
  Erc20Service,
  ERC20TokenData,
} from '../../shared/services/blockchain/erc20.service'
import { ConversionService } from '../../shared/services/conversion.service'
import { DialogService } from '../../shared/services/dialog.service'
import { GasService } from '../../shared/services/blockchain/gas.service'
import { ErrorService } from '../../shared/services/error.service'
import { ActivatedRoute } from '@angular/router'
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs/operators'
import { ERC20__factory } from '../../../../types/ethers-contracts'
import { Network } from '../../shared/networks'
import { IssuerService } from '../../shared/services/blockchain/issuer/issuer.service'
import { PreferenceStore } from '../../preference/state/preference.store'

@Component({
  selector: 'app-request-send-action',
  templateUrl: './request-send-action.component.html',
  styleUrls: ['./request-send-action.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestSendActionComponent {
  refreshRequestSend = new BehaviorSubject<void>(undefined)

  state$!: Observable<RequestSendState>
  stateWithStatus$!: Observable<WithStatus<RequestSendState>>

  isUserLoggedIn$ = this.sessionQuery.isLoggedIn$
  shouldTransfer$: Observable<boolean>

  transferForm: FormGroup

  bigNumberConstants = constants

  issuer$ = this.issuerService.issuer$

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private requestSendService: RequestSendService,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private preferenceStore: PreferenceStore,
    private signerService: SignerService,
    private erc20Service: Erc20Service,
    private conversion: ConversionService,
    private dialogService: DialogService,
    private gasService: GasService,
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private issuerService: IssuerService
  ) {
    const requestSendID = this.route.snapshot.params.id

    const tokenBalance$ = (
      tokenAddress: string
    ): Observable<BigNumber | undefined> => {
      return this.preferenceQuery.address$.pipe(
        switchMap((address) =>
          !!address
            ? this.erc20Service.tokenBalance$(tokenAddress)
            : of(undefined)
        )
      )
    }
    const nativeTokenBalance$ = this.erc20Service.nativeTokenBalance$()

    this.state$ = this.refreshRequestSend.asObservable().pipe(
      switchMap(() => requestSendService.getRequest(requestSendID)),
      tap((req) => this.preferenceStore.update({ chainID: req.chain_id })),
      switchMap((requestSend) =>
        combineLatest([
          of(requestSend),
          requestSend.asset_type == AssetType.Native
            ? of({
                address: '0x0',
                name: this.preferenceQuery.network.nativeCurrency.name,
                symbol: this.preferenceQuery.network.nativeCurrency.symbol,
                decimals: 18,
              })
            : this.erc20Service.getData(requestSend.token_address),
          requestSend.asset_type == AssetType.Native
            ? nativeTokenBalance$
            : tokenBalance$(requestSend.token_address),
          this.preferenceQuery.network$,
          this.assetService
            .getAssetWithInfo(requestSend.token_address, true)
            .pipe(catchError(() => of(undefined))),
        ])
      ),
      map(([requestSend, tokenData, balance, network, asset]) => ({
        requestSend,
        tokenData,
        balance,
        network,
        asset,
      })),
      distinctUntilChanged((p, c) => JSON.stringify(p) === JSON.stringify(c)),
      switchMap((state) => {
        this.transferForm
          .get('tokenAmount')
          ?.patchValue(
            this.conversion
              .parseToken(
                BigNumber.from(state.requestSend.amount),
                state.tokenData.decimals
              )
              .replace(/(\.0$)/, '')
          )
        this.transferForm
          .get('recipientAddress')
          ?.setValue(state.requestSend.recipient_address)

        return of({
          ...state,
          parsedAmount: this.transferForm.get('tokenAmount')?.value.toString(),
        })
      }),
      shareReplay(1)
    )
    this.stateWithStatus$ = withStatus(this.state$)

    this.shouldTransfer$ = combineLatest([this.isUserLoggedIn$]).pipe(
      map(([isUserLoggedIn]) => isUserLoggedIn),
      distinctUntilChanged()
    )

    this.transferForm = this.fb.group({
      tokenAmount: ['', Validators.required, this.amountValidator(this.state$)],
      recipientAddress: ['', Validators.required],
    })
  }

  transfer(state: RequestSendState) {
    return () => {
      return this.signerService.ensureAuth.pipe(
        switchMap((signer) =>
          state.requestSend.asset_type === AssetType.Native
            ? this.dialogService.waitingApproval(
                this.gasService
                  .withOverrides((overrides) =>
                    signer.populateTransaction({
                      to: state.requestSend.recipient_address,
                      data: state.requestSend.send_tx.data,
                      value: state.requestSend.amount,
                      ...overrides,
                    })
                  )
                  .pipe(
                    switchMap((tx) => this.signerService.sendTransaction(tx))
                  )
              )
            : of(ERC20__factory.connect(state.tokenData.address, signer)).pipe(
                switchMap((contract) =>
                  this.dialogService.waitingApproval(
                    combineLatest([
                      of(contract),
                      this.gasService.overrides,
                    ]).pipe(
                      concatMap(([contract, overrides]) => {
                        const tokenAmount = this.conversion.toToken(
                          state.requestSend.amount,
                          state.tokenData.decimals
                        )
                        return contract.populateTransaction.transfer(
                          state.requestSend.recipient_address,
                          tokenAmount.toString(),
                          overrides
                        )
                      }),
                      map((tx) => {
                        tx.data = state.requestSend.send_tx.data
                        return tx
                      }),
                      switchMap((tx) => this.signerService.sendTransaction(tx))
                    )
                  )
                )
              )
        ),
        switchMap((tx) =>
          this.dialogService.waitingTransaction(
            from(this.sessionQuery.provider.waitForTransaction(tx.hash))
          )
        ),
        this.errorService.handleError(),
        switchMapTap((tx) =>
          this.requestSendService.updateRequest(state.requestSend.id, {
            tx_hash: tx.transactionHash,
            caller_address: this.preferenceQuery.getValue().address,
          })
        ),
        tap(() => this.refreshRequestSend.next()),
        switchMap(() =>
          this.dialogService.success({
            message: 'Transfer done.',
          })
        )
      )
    }
  }

  private amountValidator(
    state$: Observable<RequestSendState>
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return state$.pipe(
        debounceTime(0),
        take(1),
        map((data) => {
          const tokenAmount = this.conversion.toToken(
            control.value || 0,
            data.tokenData.decimals
          )

          if (data.balance === undefined) {
            return { userNotLoggedIn: true }
          } else if (tokenAmount.lte(constants.Zero)) {
            return { tokenAmountBelowZero: true }
          } else if (tokenAmount.gt(data.balance)) {
            return { tokenAmountAboveBalance: true }
          }

          return null
        }),
        tap(() => ɵmarkDirty(this))
      )
    }
  }

  login(): Observable<unknown> {
    return this.signerService.ensureAuth
  }
}

interface RequestSendState {
  requestSend: RequestSend
  tokenData: ERC20TokenData
  balance: BigNumber | undefined
  network: Network
  asset?: CommonAssetWithInfo
  parsedAmount: string
}
