import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { BehaviorSubject, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { RequestBalanceService } from 'src/app/request-balance/request-balance.service'
import { AssetType } from 'src/app/request-send/request-send.service'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { UserService } from 'src/app/shared/services/user.service'

@Component({
  selector: 'app-authorization-new',
  templateUrl: './authorization-new.component.html',
  styleUrls: ['./authorization-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationNewComponent {

  newAuthRequestForm = new FormGroup({
    walletAddress: new FormControl(),
    beforeMessage: new FormControl(),
    afterMessage: new FormControl()
  })

  constructor(private balanceService: RequestBalanceService,
    private preferenceQuery: PreferenceQuery,
    private dialogService: DialogService) { }


  onSubmit() {
    const chain = this.preferenceQuery.network.chainID
    const formControls = this.newAuthRequestForm.controls
    this.balanceService.createRequest({
      asset_type: AssetType.Token,
      wallet_address: formControls.walletAddress.value,
      chain_id: this.preferenceQuery.network.chainID,
      token_address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      screen_config: {
        before_action_message: formControls.beforeMessage.value,
        after_action_message: formControls.afterMessage.value
      }
    }).subscribe(res => {
      this.dialogService.success({
        message: "Successfully created a new authorization request"
      })
    })
  }

}
