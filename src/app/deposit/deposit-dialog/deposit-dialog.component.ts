import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core'
import {BehaviorSubject, last, of} from 'rxjs'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'
import {StablecoinBigNumber, StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {constants} from 'ethers'
import {DepositRampService} from '../deposit-ramp.service'
import {switchMap, tap} from 'rxjs/operators'
import {SwapUniswapService} from '../swap-uniswap.service'
import {UserService} from '../../shared/services/user.service'
import {FaucetService} from '../../shared/services/backend/faucet.service'
import {AutoInvestService} from '../../shared/services/backend/auto-invest.service'
import {RouterService} from '../../shared/services/router.service'
import {switchMapTap} from '../../shared/utils/observables'
import {DialogService} from '../../shared/services/dialog.service'
import {BackendHttpClient} from '../../shared/services/backend/backend-http-client.service'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {AuthProvider} from '../../preference/state/preference.store'
import {RampInstantEventTypes} from '@ramp-network/ramp-instant-sdk'
import {ConversionService} from '../../shared/services/conversion.service'


@Component({
  selector: 'app-deposit-dialog',
  templateUrl: './deposit-dialog.component.html',
  styleUrls: ['./deposit-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositDialogComponent implements OnInit {
  private dataSub = new BehaviorSubject<DepositDialogData>({
    amount: constants.Zero,
  })
  data$ = this.dataSub.asObservable()

  isRampAvailable$ = this.depositRampService.isAvailable$
  isUniswapAvailable$ = this.swapUniswapService.isAvailable$

  constructor(@Inject(MAT_DIALOG_DATA) @Optional() public data: DepositDialogData,
              @Optional() private dialogRef: MatDialogRef<DepositDialogComponent>,
              private preferenceQuery: PreferenceQuery,
              private dialogService: DialogService,
              private router: RouterService,
              public stablecoin: StablecoinService,
              private http: BackendHttpClient,
              private conversion: ConversionService,
              private userService: UserService,
              private faucetService: FaucetService,
              private autoInvestService: AutoInvestService,
              private depositRampService: DepositRampService,
              private swapUniswapService: SwapUniswapService) {
  }

  ngOnInit(): void {
    if (!this.data) {
      return
    }

    this.dataSub.next({
      amount: this.data.amount,
      campaignAddress: this.data.campaignAddress,
      min: this.data.min,
    })
  }

  showRamp(amount: StablecoinBigNumber, campaignAddress?: string, min?: StablecoinBigNumber) {
    const adjustedAmount = this.adjustDepositAmount(amount, min)

    return () => {
      return this.http.ensureAuth.pipe(
        switchMap(() => this.depositRampService.showWidget(adjustedAmount, {
          setEmail: this.preferenceQuery.getValue().authProvider === AuthProvider.MAGIC,
        })),
        tap(state => {
          if (state.event.type === RampInstantEventTypes.PURCHASE_CREATED) {
            this.faucetService.topUp.subscribe()
          }
        }),
        last(),
        switchMapTap(state => {
          return state.purchaseCreated && campaignAddress ?
            this.autoInvestService.submit(adjustedAmount, campaignAddress).pipe(
              switchMap(() => this.dialogService.success({
                title: 'Your investment has been noted',
                message: 'We will automatically execute the buy order as soon as you receive the funds on your Wallet.' +
                  'You will receive emails from RAMP about the wallet funding process. ' +
                  'Visit the Portfolio page to check the investment status.',
              })),
              switchMap(() => this.stablecoin.approveAmount(campaignAddress, adjustedAmount)),
            ) : of(undefined)
        }),
        switchMapTap(state => {
          return state.successFinish ?
            of(this.dialogRef.close()).pipe(
              switchMap(() => this.router.navigate(['/portfolio'])),
            ) : of(undefined)
        }),
      )
    }
  }

  getUniswapLink$(amount: StablecoinBigNumber) {
    return this.swapUniswapService.getLink(amount)
  }

  /**
   * Some fiat to crypto exchanges like Ramp don't ensure we'll receive
   * the exact amount of proposed cryptocurrency, so we need to raise the amount
   * to have a safety margin that will surpass the minimum allowed investment value.
   * @private
   */
  private adjustDepositAmount(amount: StablecoinBigNumber, min?: StablecoinBigNumber): StablecoinBigNumber {
    if (!min || min.lt(constants.Zero)) return amount

    const minSafe = this.addSafetyMargin(min)
    const shouldAdjust = amount.lt(minSafe)

    return shouldAdjust ? this.addSafetyMargin(amount) : amount
  }

  /**
   * There are a few options to add a safety margin, but the most effective one is raising the
   * amount with some percentage (e.g. 0.05% of the original value; proposed by Ramp team),
   * trimming the value to a whole number and adding 1.
   * @private
   */
  private addSafetyMargin(value: StablecoinBigNumber) {
    const scaled = this.conversion.scale(value, 1.0005)
    const trimmed = this.conversion.trim(scaled, 'stablecoin')

    return trimmed.add(this.conversion.toStablecoin('1'))
  }
}

export interface DepositDialogData {
  amount: StablecoinBigNumber
  campaignAddress?: string
  min?: StablecoinBigNumber
}
