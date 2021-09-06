import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {of} from 'rxjs'

@Component({
  selector: 'app-admin-asset-new',
  templateUrl: './admin-asset-new.component.html',
  styleUrls: ['./admin-asset-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetNewComponent {

  createForm: FormGroup

  constructor(private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      ansName: ['', Validators.required],
      logo: [undefined, Validators.required],
      description: ['', Validators.required],
      initialTokenSupply: [0, [Validators.required, Validators.min(0)]],
      symbol: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('[A-Za-z0-9]')]],
      whitelistRequiredForRevenueClaim: [false, Validators.required],
      whitelistRequiredForLiquidationClaim: [false, Validators.required],
    })
  }

  create() {
    console.log("whitelistRequiredForRevenueClaim: " + this.createForm.value.whitelistRequiredForRevenueClaim)
    console.log("whitelistRequiredForLiquidationClaim: " + this.createForm.value.whitelistRequiredForLiquidationClaim)
    return of(undefined)
  }

  // TODO implement logic
}
