import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import {
  Erc20Service,
  ERC20TokenData,
} from '../../shared/services/blockchain/erc20.service'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { ConversionService } from '../../shared/services/conversion.service'
import { DialogService } from '../../shared/services/dialog.service'
import {
  catchError,
  distinctUntilChanged,
  shareReplay,
  startWith,
} from 'rxjs/operators'
import { RequestSendService } from '../request-send.service'

@Component({
  selector: 'app-request-send-new',
  templateUrl: './request-send-new.component.html',
  styleUrls: ['./request-send-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestSendNewComponent {
  newRequestSendForm: FormGroup
  asset$: Observable<ERC20TokenData | undefined>
  address$: Observable<string> = this.preferenceQuery.address$
  alwaysTrueSub = new BehaviorSubject(true)

  constructor(
    private requestSendService: RequestSendService,
    private fb: FormBuilder,
    private erc20Service: Erc20Service,
    private preferenceQuery: PreferenceQuery,
    private conversion: ConversionService,
    private dialogService: DialogService
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
      paymentNote: [''],
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

  createRequest(asset: ERC20TokenData, recipient: string) {
    return () => {
      const amount = this.conversion.toToken(
        this.newRequestSendForm.value.tokenAmount || 0,
        asset.decimals
      )

      return this.requestSendService
        .createRequestWithAPI({
          amount: amount.toString(),
          asset_type: 'TOKEN',
          token_address: asset.address,
          recipient_address: recipient,
        })
        .pipe(
          switchMap((res) =>
            this.dialogService.success({
              message: 'Send request created.',
            })
          )
        )
    }
  }
}
