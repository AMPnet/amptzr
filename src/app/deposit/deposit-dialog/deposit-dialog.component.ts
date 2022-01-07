import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core'
import {BehaviorSubject, last, of, scan} from 'rxjs'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'
import {StablecoinBigNumber, StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {constants} from 'ethers'
import {DepositRampService} from '../deposit-ramp.service'
import {map, switchMap, tap} from 'rxjs/operators'
import {RampInstantEvents, RampInstantEventTypes} from '@ramp-network/ramp-instant-sdk'
import {SwapUniswapService} from '../swap-uniswap.service'
import {UserService} from '../../shared/services/user.service'
import {FaucetService} from '../../shared/services/backend/faucet.service'
import {AutoInvestService} from '../../shared/services/backend/auto-invest.service'
import {RouterService} from '../../shared/services/router.service'


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
              private router: RouterService,
              public stablecoin: StablecoinService,
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
      return this.depositRampService.showWidget(amount).pipe(
        scan((acc, event) => {
          return ({
            purchaseCreated: acc.purchaseCreated ? true :
              event.type === RampInstantEventTypes.PURCHASE_CREATED,
            successFinish: acc.successFinish ? true :
              event.type === RampInstantEventTypes.WIDGET_CLOSE && !!event.payload,
            event: event,
          }) as RampWidgetEventState
        }, {
          purchaseCreated: false,
          successFinish: false,
          event: undefined as unknown,
        } as RampWidgetEventState),
        tap(eventState => {
          if (eventState.event.type === RampInstantEventTypes.PURCHASE_CREATED) {
            this.faucetService.topUp.subscribe()
          }
        }),
        last(),
        switchMap(eventState => {
          return eventState.purchaseCreated && campaignAddress ?
            this.autoInvestService.submit(amount, campaignAddress).pipe(
              switchMap(() => this.stablecoin.approveAmount(campaignAddress, amount)),
              map(() => eventState),
            ) :
            of(eventState)
        }),
        switchMap(eventState => {
          return eventState.successFinish ?
            of(eventState).pipe(
              tap(() => this.dialogRef.close()),
              switchMap(() => this.router.navigate(['/portfolio']))
            ) :
            of(eventState)
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

interface RampWidgetEventState {
  purchaseCreated: boolean
  successFinish: boolean
  event: RampInstantEvents
}
