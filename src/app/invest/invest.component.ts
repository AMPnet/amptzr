import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors} from '@angular/forms'
import {BehaviorSubject, combineLatest, Observable, of, throwError} from 'rxjs'
import {withStatus, WithStatus} from '../shared/utils/observables'
import {map, shareReplay, switchMap, take, tap} from 'rxjs/operators'
import {ActivatedRoute} from '@angular/router'
import {StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {DialogService} from '../shared/services/dialog.service'
import {RouterService} from '../shared/services/router.service'
import {SessionQuery} from '../session/state/session.query'
import {InvestService, PreInvestData} from '../shared/services/invest.service'
import {CampaignService, CampaignWithInfo} from '../shared/services/blockchain/campaign/campaign.service'
import {NameService} from '../shared/services/blockchain/name.service'
import {CampaignFlavor} from '../shared/services/blockchain/flavors'

@Component({
  selector: 'app-invest',
  templateUrl: './invest.component.html',
  styleUrls: ['./invest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestComponent {
  investState = InvestState

  campaign$: Observable<CampaignWithInfo>
  campaignWithStatus$: Observable<WithStatus<CampaignWithInfo>>

  preInvestData$: Observable<PreInvestData>
  preInvestDataWithStatus$: Observable<WithStatus<PreInvestData>>

  investStateSub = new BehaviorSubject<InvestState>(InvestState.Editing)
  investState$ = this.investStateSub.asObservable()

  investmentForm: FormGroup

  constructor(private fb: FormBuilder,
              private campaignService: CampaignService,
              private nameService: NameService,
              private sessionQuery: SessionQuery,
              private stablecoin: StablecoinService,
              private dialogService: DialogService,
              private investService: InvestService,
              private router: RouterService,
              private route: ActivatedRoute) {
    const campaignId = this.route.snapshot.params.id
    const campaignCommon$ = this.nameService.getCampaign(campaignId).pipe(
      shareReplay(1),
    )

    this.campaign$ = campaignCommon$.pipe(
      switchMap(campaignCommon => this.campaignService.getCampaignInfo(campaignCommon.campaign)),
      shareReplay(1),
    )

    this.campaignWithStatus$ = withStatus(this.campaign$)

    this.preInvestData$ = campaignCommon$.pipe(
      switchMap(address => this.investService.preInvestData(address)),
      tap(stats => {
        if (stats.min === stats.max) this.investmentForm.setValue({amount: stats.min})
      }),
      shareReplay(1),
    )

    this.preInvestDataWithStatus$ = withStatus(this.preInvestData$)

    this.investmentForm = this.fb.group({
      amount: [0, [], [this.validAmount.bind(this)]],
    })
  }

  private validAmount(control: AbstractControl): Observable<ValidationErrors | null> {
    return combineLatest([this.preInvestData$]).pipe(take(1),
      map(([data]) => {
        const amount = control.value

        if (data.userInvestGap === 0) {
          return {userMaxReached: true}
        } else if (data.max === 0) {
          return {campaignMaxReached: true}
        } else if (data.walletBalance === 0) {
          return {walletBalanceTooLow: true}
        } else if (!amount) {
          return {amountEmpty: true}
        } else if (amount < data.min) {
          return {amountTooLow: true}
        } else if (amount > data.max) {
          return {amountTooHigh: true}
        } else if (amount > data.walletBalance) {
          return {walletBalanceTooLow: true}
        }

        return null
      }),
      tap(() => ɵmarkDirty(this)),
    )
  }

  goToReview() {
    return this.getAllowance().pipe(
      switchMap(allowance => allowance < this.investmentForm.value.amount ?
        this.approveFlow(this.investmentForm.value.amount) : of(allowance),
      ),
      tap(() => this.investStateSub.next(InvestState.InReview)),
    )
  }

  private getAllowance(): Observable<number> {
    return combineLatest([this.campaign$]).pipe(take(1),
      switchMap(([campaign]) => this.stablecoin.getAllowance(campaign.contractAddress)),
    )
  }

  private approveFlow(amount: number) {
    return this.dialogService.info(
      'You will be asked to sign the transaction to allow investment from your wallet.',
    ).pipe(
      switchMap(res => res ? this.approveAmount(amount) : throwError('USER_DISMISSED_APPROVE_FLOW')),
    )
  }

  private approveAmount(amount: number) {
    return combineLatest([this.campaign$]).pipe(take(1),
      switchMap(([campaign]) => this.stablecoin.approveAmount(
        campaign.contractAddress, amount,
      )),
    )
  }

  backToEdit() {
    this.investStateSub.next(InvestState.Editing)
  }

  invest() {
    return combineLatest([this.campaign$]).pipe(take(1),
      switchMap(([campaign]) => this.campaignService.invest(
        campaign.contractAddress,
        campaign.flavor as CampaignFlavor,
        this.investmentForm.value.amount,
      )),
      switchMap(() => this.router.navigate(['/portfolio'])),
    )
  }
}

enum InvestState {
  Editing,
  InReview,
}
