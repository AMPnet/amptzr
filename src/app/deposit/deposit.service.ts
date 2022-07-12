import { Injectable } from '@angular/core'
import { combineLatest, Observable, of } from 'rxjs'
import { ToUrlIPFSPipe } from '../shared/pipes/to-url-ipfs.pipe'
import { switchMap, take } from 'rxjs/operators'
import { IssuerService } from '../shared/services/blockchain/issuer/issuer.service'
import {
  StablecoinBigNumber,
  StablecoinService,
} from '../shared/services/blockchain/stablecoin.service'
import { SignerService } from '../shared/services/signer.service'
import {
  DepositDialogComponent,
  DepositDialogData,
} from './deposit-dialog/deposit-dialog.component'
import { DialogService } from '../shared/services/dialog.service'
import { PreferenceQuery } from '../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class DepositService {
  address$ = this.preferenceQuery.address$
  issuer$ = this.issuerService.issuer$

  constructor(
    private preferenceQuery: PreferenceQuery,
    private issuerService: IssuerService,
    private signerService: SignerService,
    private toUrlIpfsPipe: ToUrlIPFSPipe,
    private stablecoinService: StablecoinService,
    private dialogService: DialogService
  ) {}

  ensureBalance(
    amount: StablecoinBigNumber,
    campaignAddress?: string,
    min?: StablecoinBigNumber
  ): Observable<EnsureBalanceRes> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.stablecoinService.balance$,
    ]).pipe(
      take(1),
      switchMap(([_signer, balance]) => {
        return balance!.gte(amount)
          ? of({
              purchaseCreated: false,
            })
          : this.openDepositDialog(amount, campaignAddress, min)
      })
    )
  }

  private openDepositDialog(
    amount: StablecoinBigNumber,
    campaignAddress?: string,
    min?: StablecoinBigNumber
  ) {
    return this.dialogService.dialog
      .open<DepositDialogComponent, DepositDialogData>(DepositDialogComponent, {
        ...this.dialogService.configDefaults,
        data: {
          amount: amount,
          campaignAddress: campaignAddress,
          min: min,
        },
      })
      .afterClosed()
  }
}

interface EnsureBalanceRes {
  purchaseCreated: boolean
}
