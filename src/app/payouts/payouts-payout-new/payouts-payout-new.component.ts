import {ChangeDetectionStrategy, Component} from '@angular/core'
import {PayoutService} from '../../shared/services/backend/payout.service'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {DialogService} from '../../shared/services/dialog.service'
import {switchMap} from 'rxjs'
import {RouterService} from '../../shared/services/router.service'
import {ActivatedRoute} from '@angular/router'

@Component({
  selector: 'app-payouts-payout-new',
  templateUrl: './payouts-payout-new.component.html',
  styleUrls: ['./payouts-payout-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutsPayoutNewComponent {
  newPayoutForm: FormGroup

  constructor(private payoutService: PayoutService,
              private fb: FormBuilder,
              private router: RouterService,
              private route: ActivatedRoute,
              private dialogService: DialogService) {
    this.newPayoutForm = this.fb.group({
      assetAddress: ['', Validators.required],
      ignoredHolderAddresses: [[]],
    })
  }

  createPayout() {
    return this.payoutService.createPayout(
      this.newPayoutForm.value.assetAddress,
      this.newPayoutForm.value.ignoredHolderAddresses,
    ).pipe(
      switchMap(() => this.dialogService.success({
        message: 'Payout snapshot requested.',
      })),
      switchMap(() => this.router.navigate(['..'], {relativeTo: this.route})),
    )
  }
}
