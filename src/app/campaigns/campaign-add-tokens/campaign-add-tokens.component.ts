import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {SignerService} from '../../shared/services/signer.service'
import {ActivatedRoute} from '@angular/router'
import {DialogService} from '../../shared/services/dialog.service'
import {map, shareReplay, switchMap, take, tap} from 'rxjs/operators'
import {BigNumber} from 'ethers'
import {AssetService, AssetState} from '../../shared/services/blockchain/asset.service'
import {combineLatest, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {SessionQuery} from '../../session/state/session.query'
import {RouterService} from '../../shared/services/router.service'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'

@Component({
  selector: 'app-campaign-add-tokens',
  templateUrl: './campaign-add-tokens.component.html',
  styleUrls: ['./campaign-add-tokens.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignAddTokensComponent {
  campaignAddress = this.route.snapshot.params.id

  campaign$: Observable<CampaignWithInfo>
  assetState$: Observable<AssetState>
  tokenBalance$: Observable<BigNumber>

  addTokensData$: Observable<WithStatus<{
    campaign: CampaignWithInfo,
    asset: AssetState,
    balance: BigNumber
  }>>

  addTokensForm: FormGroup

  constructor(private assetService: AssetService,
              private campaignService: CampaignService,
              private signerService: SignerService,
              private sessionQuery: SessionQuery,
              private router: RouterService,
              private route: ActivatedRoute,
              private stablecoin: StablecoinService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.campaign$ = this.campaignService.getCampaignWithInfo(this.campaignAddress).pipe(
      shareReplay(1),
    )

    this.assetState$ = this.campaign$.pipe(
      switchMap(campaign => this.sessionQuery.provider$.pipe(
        switchMap(provider => this.assetService.getState(campaign.asset, provider)),
      )),
    )

    this.tokenBalance$ = this.campaign$.pipe(
      switchMap(campaign => this.assetService.balance(campaign.asset)),
    )

    this.addTokensData$ = withStatus(
      combineLatest([
        this.campaign$,
        this.assetState$,
        this.tokenBalance$,
      ]).pipe(
        map(([campaign, asset, balance]) => ({campaign, asset, balance})),
      ),
    )

    this.addTokensForm = this.fb.group({
      amount: [0, [Validators.required], [this.validAmount.bind(this)]],
    })
  }

  addTokens(campaign: CampaignWithInfo) {
    return () => {
      return this.assetService.transferTokensToCampaign(
        campaign.asset, campaign.contractAddress,
        this.addTokensForm.value.amount,
      ).pipe(
        switchMap(() => this.dialogService.info('Tokens added to campaign.', false)),
        switchMap(() => this.router.router.navigate([`/campaigns/${this.campaignAddress}`])),
      )
    }
  }

  private validAmount(control: AbstractControl): Observable<ValidationErrors | null> {
    return combineLatest([this.tokenBalance$]).pipe(take(1),
      map(([balance]) => this.stablecoin.format(balance)),
      map(balance => {
        const amount = control.value

        if (amount === 0) {
          return {amountZero: true}
        } else if (amount > balance) {
          return {amountAboveBalance: true}
        } else {
          return null
        }
      }),
      tap(() => ɵmarkDirty(this)),
    )
  }
}
