import {ChangeDetectionStrategy, Component} from '@angular/core'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors} from "@angular/forms"
import {of} from "rxjs"
import {RouterService} from "../../shared/services/router.service"
import {DialogService} from "../../shared/services/dialog.service"
import {RampInstantEventTypes} from '@ramp-network/ramp-instant-sdk'
import {DepositRampService} from '../deposit-ramp.service'
import {switchMap} from 'rxjs/operators'

@Component({
  selector: 'app-deposit-flow',
  templateUrl: './deposit-flow.component.html',
  styleUrls: ['./deposit-flow.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositFlowComponent {
  depositForm: FormGroup

  constructor(private fb: FormBuilder,
              private routerService: RouterService,
              private depositRampService: DepositRampService,
              private dialogService: DialogService) {
    this.depositForm = this.fb.group({
      amount: [0, DepositFlowComponent.validAmount],
    })
  }

  showRamp() {
    return this.depositRampService.showWidget(this.depositForm.value.amount).pipe(
      switchMap(event => {
        if (event.type === RampInstantEventTypes.WIDGET_CLOSE && event.payload) {
          // payload is non-empty only when user clicks on the success button
          return this.dialogService.info('Funds will be visible in your wallet shortly.', false).pipe(
            switchMap(() => this.routerService.navigate(['/wallet'])),
          )
        }

        return of(event)
      }),
    )
  }

  private static validAmount(control: AbstractControl): ValidationErrors | null {
    if (control.value <= 0) {
      return {amountTooLow: true}
    } else if (control.value > 20_000) {
      return {amountTooHigh: true}
    }

    return null
  }
}
