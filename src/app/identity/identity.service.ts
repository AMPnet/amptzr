import {Injectable} from '@angular/core'
import {combineLatest, Observable, of} from 'rxjs'
import {delay, filter, map, repeatWhen, switchMap, take, tap} from 'rxjs/operators'
import {VeriffService} from './veriff/veriff.service'
import {BackendUserService} from '../shared/services/backend/backend-user.service'
import {IssuerService} from '../shared/services/blockchain/issuer.service'
import {SignerService} from '../shared/services/signer.service'
import {SessionQuery} from '../session/state/session.query'
import {CampaignService} from '../shared/services/blockchain/campaign.service'
import {PreferenceQuery} from '../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  constructor(private backendUser: BackendUserService,
              private signerService: SignerService,
              private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private issuerService: IssuerService,
              private campaignService: CampaignService,
              private veriffService: VeriffService) {
  }

  ensureIdentityChecked(campaignAddress: string): Observable<void> {
    return this.checkOnIssuerProcedure(campaignAddress).pipe(
      switchMap(identityChecked => identityChecked ? of(undefined) : this.checkOnBackendProcedure),
    )
  }

  private checkOnIssuerProcedure(campaignAddress: string): Observable<boolean> {
    return this.signerService.ensureAuth.pipe(take(1),
      switchMap(() => this.campaignService.isWhitelistRequired(campaignAddress).pipe(
        switchMap(isWhitelistRequired => !isWhitelistRequired ? of(true) :
          this.issuerService.isWalletApproved(this.sessionQuery.getValue().address!),
        ))),
    )
  }

  private get checkOnBackendProcedure(): Observable<void> {
    return this.backendCheck.pipe(
      switchMap(whitelistedOnBackend => whitelistedOnBackend ?
        of(undefined) : this.openIdentityDialog),
      switchMap(() => this.whitelistOnBackend()),
      switchMap(() => this.waitUntilIssuerCheckPassed),
    )
  }

  private get backendCheck(): Observable<boolean> {
    return this.backendUser.getUser().pipe(
      map(user => user.kyc_completed),
    )
  }

  private get issuerCheck(): Observable<boolean> {
    return this.signerService.ensureAuth.pipe(
      switchMap(() => this.issuerService.isWalletApproved(this.sessionQuery.getValue().address!)),
      take(1),
    )
  }

  private get waitUntilIssuerCheckPassed(): Observable<void> {
    return this.issuerCheck.pipe(
      repeatWhen(obs => obs.pipe(delay(1000))),
      filter(hasPassed => hasPassed),
      take(1),
      map(() => undefined),
    )
  }

  private whitelistOnBackend() {
    return combineLatest([
      this.issuerService.issuer$,
    ]).pipe(take(1),
      switchMap(([issuer]) => this.backendUser.whitelistUser({
        issuer_address: issuer.contractAddress,
        chain_id: this.preferenceQuery.network.chainID,
      })),
    )
  }

  private get openIdentityDialog(): Observable<void> {
    return this.veriffService.openVeriffDialog()
  }
}
