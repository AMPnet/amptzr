import {ChangeDetectionStrategy, Component} from '@angular/core'
import {RampInstantSDK} from "@ramp-network/ramp-instant-sdk"
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors} from "@angular/forms"
import {SessionQuery} from "../../session/state/session.query"
import {IssuerService, IssuerWithInfo} from "../../shared/services/blockchain/issuer.service"
import {combineLatest, Observable} from "rxjs"
import {ToUrlIPFSPipe} from "../../shared/pipes/to-url-ipfs.pipe"
import {PreferenceQuery} from "../../preference/state/preference.query"
import {RouterService} from "../../shared/services/router.service"
import {DialogService} from "../../shared/services/dialog.service"

@Component({
  selector: 'app-deposit-flow',
  templateUrl: './deposit-flow.component.html',
  styleUrls: ['./deposit-flow.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositFlowComponent {
  address$ = this.sessionQuery.address$
  issuer$: Observable<IssuerWithInfo>
  depositForm: FormGroup

  constructor(private fb: FormBuilder,
              private issuerService: IssuerService,
              private sessionQuery: SessionQuery,
              private toUrlIpfsPipe: ToUrlIPFSPipe,
              private preferenceQuery: PreferenceQuery,
              private routerService: RouterService,
              private dialogService: DialogService,) {
    this.depositForm = this.fb.group({
      amount: [0, [DepositFlowComponent.validAmount], []],
    })
    this.issuer$ = issuerService.issuer$
  }

  showRamp() {
    combineLatest([this.issuer$, this.address$]).subscribe(([issuer, address]) => {
      new RampInstantSDK({
        hostAppName: 'Wallet',
        hostLogoUrl: this.toUrlIpfsPipe.transform(issuer.logo),
        swapAsset: this.preferenceQuery.network.ramp.swapAsset,
        fiatCurrency: 'USD',
        fiatValue: this.depositForm.value.amount,
        userAddress: address,
        url: this.preferenceQuery.network.ramp.url,
      })
        .on("WIDGET_CLOSE" as "*", event => {
          if (event.payload) { // WIDGET_CLOSE event has payload only when user clicks on the success button
            this.routerService.navigate(["/wallet"]).then(
              () => this.dialogService.info("Funds will be visible in your wallet shortly.", false)
            )
          }
        })
        .show()
    })
  }

  private static validAmount(control: AbstractControl): ValidationErrors | null {
    if (control.value === 0) {
      return {amountTooLow: true}
    } else if (control.value > 20_000) {
      return {amountTooHigh: true}
    }

    return null
  }
}
