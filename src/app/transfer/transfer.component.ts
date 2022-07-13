import { ChangeDetectionStrategy, Component, ɵmarkDirty } from '@angular/core'
import { combineLatest, concatMap, from, Observable, of, timer } from 'rxjs'
import { withStatus, WithStatus } from '../shared/utils/observables'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { BigNumber, BigNumberish, constants } from 'ethers'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../shared/services/blockchain/asset/asset.service'
import { SessionQuery } from '../session/state/session.query'
import { PreferenceQuery } from '../preference/state/preference.query'
import { SignerService } from '../shared/services/signer.service'
import { ConversionService } from '../shared/services/conversion.service'
import { RouterService } from '../shared/services/router.service'
import { ActivatedRoute } from '@angular/router'
import {
  catchError,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs/operators'
import { ERC20__factory } from '../../../types/ethers-contracts'
import { DialogService } from '../shared/services/dialog.service'
import { GasService } from '../shared/services/blockchain/gas.service'
import { ErrorService } from '../shared/services/error.service'
import { Network } from '../shared/networks'
import { CrispService } from '../shared/services/crisp.service'
import {
  Erc20Service,
  ERC20TokenData,
} from '../shared/services/blockchain/erc20.service'

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferComponent {
  state$!: Observable<TransferState>
  stateWithStatus$!: Observable<WithStatus<TransferState>>

  transferForm: FormGroup

  isUserLoggedIn$ = this.sessionQuery.isLoggedIn$
  shouldTransfer$: Observable<boolean>

  bigNumberConstants = constants

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private signerService: SignerService,
    private erc20Service: Erc20Service,
    private conversion: ConversionService,
    private dialogService: DialogService,
    private gasService: GasService,
    private errorService: ErrorService,
    public crispService: CrispService,
    private router: RouterService,
    private route: ActivatedRoute
  ) {
    const transferParams = this.route.snapshot.queryParams as TransferParams

    const tokenBalance$: Observable<BigNumber | undefined> =
      this.preferenceQuery.address$.pipe(
        switchMap((address) =>
          !!address
            ? this.erc20Service.tokenBalance$(transferParams.tokenAddress)
            : of(undefined)
        )
      )

    this.state$ = combineLatest([
      this.erc20Service.getData(transferParams.tokenAddress),
      tokenBalance$,
      this.preferenceQuery.network$,
      this.assetService
        .getAssetWithInfo(transferParams.tokenAddress, true)
        .pipe(catchError(() => of(undefined))),
    ]).pipe(
      map(([tokenData, balance, network, asset]) => ({
        tokenData,
        balance,
        network,
        asset,
      })),
      distinctUntilChanged((p, c) => JSON.stringify(p) === JSON.stringify(c)),
      tap((state) => {
        if (this.transferForm.get('tokenAmount')!.dirty) return

        if (transferParams.amount)
          this.setTokenValue(state, transferParams.amount)
      }),
      tap(() => {
        timer(0)
          .pipe(
            tap(() => {
              this.transferForm.get('tokenAmount')!.updateValueAndValidity()
            })
          )
          .subscribe()
      }),
      shareReplay(1)
    )
    this.stateWithStatus$ = withStatus(this.state$)

    this.shouldTransfer$ = combineLatest([this.isUserLoggedIn$]).pipe(
      map(([isUserLoggedIn]) => isUserLoggedIn),
      distinctUntilChanged()
    )

    this.transferForm = this.fb.group(
      {
        tokenAmount: [''],
        recipientAddress: [
          transferParams.recipientAddress || '',
          [Validators.required, Validators.pattern(/^(0x)[0-9A-Fa-f]{40}$/)],
        ],
      },
      {
        asyncValidators: this.amountValidator.bind(this),
      }
    )
  }

  transfer(state: TransferState) {
    return () => {
      return this.signerService.ensureAuth.pipe(
        map((signer) =>
          ERC20__factory.connect(state.tokenData.address, signer)
        ),
        switchMap((contract) =>
          this.dialogService.waitingApproval(
            combineLatest([of(contract), this.gasService.overrides]).pipe(
              concatMap(([contract, overrides]) => {
                const tokenAmount = this.conversion.toToken(
                  this.transferForm.value.tokenAmount,
                  state.tokenData.decimals
                )

                return contract.populateTransaction.transfer(
                  this.transferForm.value.recipientAddress,
                  tokenAmount.toString(),
                  overrides
                )
              }),
              switchMap((tx) => this.signerService.sendTransaction(tx))
            )
          )
        ),
        switchMap((tx) =>
          this.dialogService.waitingTransaction(
            from(this.sessionQuery.provider.waitForTransaction(tx.hash))
          )
        ),
        this.errorService.handleError(),
        switchMap(() =>
          this.dialogService.success({
            message: 'Transfer done.',
          })
        ),
        tap(() => this.router.navigate(['/wallet']))
      )
    }
  }

  private amountValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return combineLatest([this.state$]).pipe(
      take(1),
      map(([data]) => {
        const tokenAmount = this.conversion.toToken(
          control.value.tokenAmount || 0,
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

  login(): Observable<unknown> {
    return this.signerService.ensureAuth
  }

  setTokenValue(state: TransferState, value: BigNumberish | 'max') {
    if (value === 'max') {
      if (!state.balance) return

      value = state.balance
    }

    try {
      value = BigNumber.from(value)
    } catch (e) {
      return
    }

    this.transferForm.patchValue({
      tokenAmount: this.conversion
        .parseToken(BigNumber.from(value), state.tokenData.decimals)
        .replace(/(\.0$)/, ''),
    })
  }
}

interface TransferState {
  tokenData: ERC20TokenData
  balance: BigNumber | undefined
  network: Network
  asset?: CommonAssetWithInfo
}

export interface TransferParams {
  tokenAddress: string
  amount: string | 'max'
  recipientAddress: string
}
