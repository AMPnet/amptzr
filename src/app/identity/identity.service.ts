import { Injectable } from '@angular/core'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, switchMap, take } from 'rxjs/operators'
import { VeriffService } from './veriff/veriff.service'
import { BackendUserService } from '../shared/services/backend/backend-user.service'
import { SignerService } from '../shared/services/signer.service'
import { PreferenceQuery } from '../preference/state/preference.query'
import {
  CampaignService,
  CampaignWithInfo,
} from '../shared/services/blockchain/campaign/campaign.service'
import { IssuerService } from '../shared/services/blockchain/issuer/issuer.service'
import { DialogService } from '../shared/services/dialog.service'

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  constructor(
    private backendUser: BackendUserService,
    private signerService: SignerService,
    private preferenceQuery: PreferenceQuery,
    private issuerService: IssuerService,
    private dialogService: DialogService,
    private campaignService: CampaignService,
    private veriffService: VeriffService
  ) {}

  ensureIdentityChecked(campaign: CampaignWithInfo): Observable<void> {
    return this.checkOnIssuer(campaign).pipe(
      switchMap((identityChecked) =>
        identityChecked ? of(undefined) : this.checkOnBackendProcedure
      )
    )
  }

  checkOnIssuer(campaign: CampaignWithInfo): Observable<boolean> {
    return this.signerService.ensureAuth.pipe(
      take(1),
      switchMap(() =>
        this.campaignService
          .isWhitelistRequired(campaign)
          .pipe(
            switchMap((isWhitelistRequired) =>
              !isWhitelistRequired
                ? of(true)
                : this.issuerService.isWalletApproved(
                    this.preferenceQuery.getValue().address!
                  )
            )
          )
      )
    )
  }

  checkOnIssuer$(campaign: CampaignWithInfo): Observable<boolean> {
    return this.signerService.ensureAuth.pipe(
      switchMap(() =>
        this.campaignService
          .isWhitelistRequired(campaign)
          .pipe(
            switchMap((isWhitelistRequired) =>
              !isWhitelistRequired
                ? of(true)
                : this.issuerService.isWalletApproved$(
                    this.preferenceQuery.getValue().address!
                  )
            )
          )
      )
    )
  }

  private get checkOnBackendProcedure(): Observable<void> {
    return this.checkOnBackend.pipe(
      switchMap((whitelistedOnBackend) =>
        whitelistedOnBackend ? of(undefined) : this.openIdentityDialog
      ),
      switchMap(() => this.whitelistOnBackend()),
      switchMap(() =>
        this.dialogService.loading(
          this.waitUntilIssuerCheckPassed,
          'Approving wallet',
          'This is usually a short process, but it might take up to a few minutes. Please wait.'
        )
      ),
      switchMap(() =>
        this.dialogService.success({
          message: 'Identity has been verified!',
        })
      )
    )
  }

  private get checkOnBackend(): Observable<boolean> {
    return this.backendUser.getUser().pipe(map((user) => user.kyc_completed))
  }

  private get waitUntilIssuerCheckPassed(): Observable<void> {
    return this.issuerService
      .isWalletApproved$(this.preferenceQuery.getValue().address!)
      .pipe(
        filter((hasPassed) => hasPassed),
        take(1),
        map(() => undefined)
      )
  }

  private whitelistOnBackend() {
    return combineLatest([this.issuerService.issuer$]).pipe(
      take(1),
      switchMap(([issuer]) =>
        this.backendUser.whitelistUser({
          issuer_address: issuer.contractAddress,
          chain_id: this.preferenceQuery.network.chainID,
        })
      )
    )
  }

  private get openIdentityDialog(): Observable<void> {
    return this.veriffService.openVeriffDialog()
  }
}
