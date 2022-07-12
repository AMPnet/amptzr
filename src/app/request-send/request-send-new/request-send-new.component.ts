import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Observable, of, switchMap } from 'rxjs'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import {
  Erc20Service,
  ERC20TokenData,
} from '../../shared/services/blockchain/erc20.service'
import { AssetService } from '../../shared/services/blockchain/asset/asset.service'
import { PayoutManagerService } from '../../shared/services/blockchain/payout-manager.service'
import { PayoutService as ContractPayoutService } from '../../shared/services/blockchain/payout.service'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { ConversionService } from '../../shared/services/conversion.service'
import { DialogService } from '../../shared/services/dialog.service'
import { RouterService } from '../../shared/services/router.service'
import { ActivatedRoute } from '@angular/router'
import {
  catchError,
  distinctUntilChanged,
  shareReplay,
  startWith,
} from 'rxjs/operators'
import { RequestSendService } from '../request-send.service'
import { getWindow } from '../../shared/utils/browser'
import { IssuerPathPipe } from '../../shared/pipes/issuer-path.pipe'

@Component({
  selector: 'app-request-send-new',
  templateUrl: './request-send-new.component.html',
  styleUrls: ['./request-send-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestSendNewComponent {
  newRequestSendForm: FormGroup
  asset$: Observable<ERC20TokenData | undefined>

  constructor(
    private requestSendService: RequestSendService,
    private fb: FormBuilder,
    private erc20Service: Erc20Service,
    private assetService: AssetService,
    private payoutManagerService: PayoutManagerService,
    private contractPayoutService: ContractPayoutService,
    private preferenceQuery: PreferenceQuery,
    private conversion: ConversionService,
    private dialogService: DialogService,
    private router: RouterService,
    private issuerPathPipe: IssuerPathPipe,
    private route: ActivatedRoute
  ) {
    this.newRequestSendForm = this.fb.group({
      assetAddress: [
        '',
        [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)],
      ],
      tokenAmount: [''],
      recipientAddress: [
        '',
        [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)],
      ],
    })

    const assetAddressChanged$ = this.newRequestSendForm
      .get('assetAddress')!
      .valueChanges.pipe(
        startWith(this.newRequestSendForm.value.assetAddress),
        distinctUntilChanged(),
        shareReplay(1)
      )

    this.asset$ = assetAddressChanged$.pipe(
      switchMap((address) =>
        /^0x[a-fA-F0-9]{40}$/.test(address)
          ? this.erc20Service
              .getData(address)
              .pipe(catchError(() => of(undefined)))
          : of(undefined)
      )
    )
  }

  createRequest(asset: ERC20TokenData) {
    return () => {
      const amount = this.conversion.toToken(
        this.newRequestSendForm.value.tokenAmount || 0,
        asset.decimals
      )

      return this.requestSendService
        .createRequest({
          chain_id: this.preferenceQuery.network.chainID,
          token_address: asset.address,
          amount: amount.toString(),
          recipient_address: this.newRequestSendForm.value.recipientAddress,
          redirect_url:
            getWindow().location.origin +
            this.issuerPathPipe.transform('/request-send/${id}/action'),
        })
        .pipe(
          switchMap((res) =>
            this.dialogService
              .success({
                message: 'Send request created.',
              })
              .pipe(
                switchMap(() =>
                  this.router.navigate([`../${res.id}`], {
                    relativeTo: this.route,
                  })
                )
              )
          )
        )
    }
  }
}
