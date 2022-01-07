import {Injectable} from '@angular/core'
import {combineLatest, Observable, of} from 'rxjs'
import {SessionQuery} from '../session/state/session.query'
import {ToUrlIPFSPipe} from '../shared/pipes/to-url-ipfs.pipe'
import {switchMap, take} from 'rxjs/operators'
import {IssuerService} from '../shared/services/blockchain/issuer/issuer.service'
import {StablecoinBigNumber, StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {SignerService} from '../shared/services/signer.service'
import {DepositDialogComponent, DepositDialogData} from './deposit-dialog/deposit-dialog.component'
import {DialogService} from '../shared/services/dialog.service'

@Injectable({
  providedIn: 'root',
})
export class DepositService {
  address$ = this.sessionQuery.address$
  issuer$ = this.issuerService.issuer$

  constructor(private sessionQuery: SessionQuery,
              private issuerService: IssuerService,
              private signerService: SignerService,
              private toUrlIpfsPipe: ToUrlIPFSPipe,
              private stablecoinService: StablecoinService,
              private dialogService: DialogService) {
  }

  ensureBalance(amount: StablecoinBigNumber, campaignAddress?: string): Observable<EnsureBalanceRes> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.stablecoinService.balance$,
    ]).pipe(take(1),
      switchMap(([_signer, balance]) => {
        return balance!.gte(amount) ? of({
          purchaseCreated: false,
        }) : this.openDepositDialog(amount, campaignAddress)
      }),
    )
  }

  private openDepositDialog(amount: StablecoinBigNumber, campaignAddress?: string) {
    return this.dialogService.dialog.open<DepositDialogComponent, DepositDialogData>(DepositDialogComponent, {
      ...this.dialogService.configDefaults,
      data: {
        amount: amount,
        campaignAddress: campaignAddress,
      },
    }).afterClosed()
  }
}

interface EnsureBalanceRes {
  purchaseCreated: boolean
}
