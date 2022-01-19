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
    })
  }

  showRamp(amount: StablecoinBigNumber, campaignAddress?: string) {
    return () => {
      return this.http.ensureAuth.pipe(
        switchMap(() => this.depositRampService.showWidget(amount, {
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
            this.autoInvestService.submit(amount, campaignAddress).pipe(
              switchMap(() => this.dialogService.success({
                title: 'Your investment has been noted',
                message: 'We will automatically execute the buy order as soon as you receive the funds on your Wallet.' +
                  'You will receive emails from RAMP about the wallet funding process. ' +
                  'Visit the Portfolio page to check the investment status.',
              })),
              switchMap(() => this.stablecoin.approveAmount(campaignAddress, amount)),
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
}

export interface DepositDialogData {
  amount: StablecoinBigNumber
  campaignAddress?: string
}
