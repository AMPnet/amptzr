import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, switchMap, tap } from 'rxjs';
import { PreferenceQuery } from 'src/app/preference/state/preference.query';
import { RequestBalanceService } from 'src/app/request-balance/request-balance.service';
import { AssetType } from 'src/app/request-send/request-send.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-authorization-new',
  templateUrl: './authorization-new.component.html',
  styleUrls: ['./authorization-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationNewComponent implements OnInit {

  newAuthRequestForm = new FormGroup({
    walletAddress: new FormControl(),
    beforeMessage: new FormControl(),
    afterMessage: new FormControl()
  })

  constructor(private balanceService: RequestBalanceService,
    private preferenceQuery: PreferenceQuery,
    private dialogService: DialogService) { }

  ngOnInit(): void {
  }


  onSubmit() {
    const chain = this.preferenceQuery.network.chainID
    this.balanceService.createRequest({
      asset_type: AssetType.Token,
      wallet_address: this.preferenceQuery.getValue().address,
      chain_id: this.preferenceQuery.network.chainID,
      token_address: "",
      screen_config: {
        before_action_message: "To log you in",
        after_action_message: "World"
      }
    }).subscribe(res => {
      this.dialogService.success({
        message: "Successfully created a new authorization request"
      })
    })
  }

}
