import {ChangeDetectionStrategy, Component} from '@angular/core'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors} from "@angular/forms"
import {last, of} from "rxjs"
import {RouterService} from "../../shared/services/router.service"
import {DepositRampService} from '../deposit-ramp.service'
import {switchMap, tap} from 'rxjs/operators'
import {ConversionService} from '../../shared/services/conversion.service'
import {FaucetService} from '../../shared/services/backend/faucet.service'
import {BackendHttpClient} from '../../shared/services/backend/backend-http-client.service'

@Component({
  selector: 'app-deposit-flow',
  templateUrl: './deposit-flow.component.html',
  styleUrls: ['./deposit-flow.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositFlowComponent {
  depositForm: FormGroup
  depositAvailable$ = this.depositRampService.isAvailable$

  constructor(private fb: FormBuilder,
              private routerService: RouterService,
              private depositRampService: DepositRampService,
              private conversion: ConversionService,
              private http: BackendHttpClient,
              private faucetService: FaucetService) {
    this.depositForm = this.fb.group({
      amount: [0, DepositFlowComponent.validAmount],
    })
  }

  showRamp() {
    const amount = this.conversion.toStablecoin(this.depositForm.value.amount)

    return this.http.ensureAuth.pipe(
      switchMap(() => this.depositRampService.showWidget(amount)),
      tap(state => {
        if (state.purchaseCreated) this.faucetService.topUp.subscribe()
      }),
      last(),
      switchMap(state => {
        if (state.successFinish) {
          // payload is non-empty only when user clicks on the success button
          return this.routerService.navigate(['/wallet'])
        }

        return of(state)
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
