import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core'
import {BehaviorSubject, of} from 'rxjs'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'
import {StablecoinBigNumber, StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {constants} from 'ethers'
import {DepositRampService} from '../deposit-ramp.service'
import {switchMap} from 'rxjs/operators'
import {RampInstantEventTypes} from '@ramp-network/ramp-instant-sdk'
import {SwapUniswapService} from '../swap-uniswap.service'

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
              public stablecoin: StablecoinService,
              private depositRampService: DepositRampService,
              private swapUniswapService: SwapUniswapService) {
  }

  ngOnInit(): void {
    if (!this.data) {
      return
    }

    this.dataSub.next({
      amount: this.data.amount,
    })
  }

  showRamp(amount: StablecoinBigNumber) {
    return () => {
      return this.depositRampService.showWidget(amount).pipe(
        switchMap(event => {
          if (event.type === RampInstantEventTypes.WIDGET_CLOSE && event.payload) {
            // payload is non-empty only when user clicks on the success button
            // return this.dialogService.info('Funds will be visible in your wallet shortly.', false).pipe(
            //   switchMap(() => this.routerService.navigate(['/wallet'])),
            // )
          }

          if (event.type === RampInstantEventTypes.PURCHASE_CREATED) {
            console.log('purchase created', event)
          }

          return of(event)
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
}
