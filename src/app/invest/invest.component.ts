import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors} from '@angular/forms'
import {BehaviorSubject, combineLatest, Observable, of, throwError} from 'rxjs'
import {withStatus, WithStatus} from '../shared/utils/observables'
import {CampaignService, CampaignWithInfo} from '../shared/services/blockchain/campaign.service'
import {map, shareReplay, switchMap, take, tap} from 'rxjs/operators'
import {ActivatedRoute} from '@angular/router'
import {StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {DialogService} from '../shared/services/dialog.service'
import {RouterService} from '../shared/services/router.service'
import {SessionQuery} from '../session/state/session.query'
import {formatEther} from 'ethers/lib/utils'

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

  balance$ = this.stablecoinService.balance$.pipe(
    shareReplay(1),
  )

  alreadyInvested$: Observable<number>
  preInvestData$: Observable<PreInvestData>

  investStateSub = new BehaviorSubject<InvestState>(InvestState.Editing)
  investState$ = this.investStateSub.asObservable()

  investmentForm: FormGroup

  constructor(private fb: FormBuilder,
              private campaignService: CampaignService,
              private sessionQuery: SessionQuery,
              private stablecoinService: StablecoinService,
              private dialogService: DialogService,
              private router: RouterService,
              private route: ActivatedRoute) {
    const campaignID = this.route.snapshot.params.id

    this.campaign$ = this.campaignService.getAddressByName(campaignID).pipe(
      switchMap(address => this.campaignService.getCampaignWithInfo(address)),
      shareReplay(1),
    )

    this.campaignWithStatus$ = withStatus(this.campaign$)

    this.alreadyInvested$ = this.campaign$.pipe(
      switchMap(campaign =>
        this.campaignService.alreadyInvested(campaign.contractAddress)),
      shareReplay(1),
    )

    this.preInvestData$ = combineLatest([
      this.campaign$,
      this.balance$,
      this.alreadyInvested$,
    ]).pipe(take(1),
      map(([campaign, balance, alreadyInvested]) => {
        const walletBalance = Number(formatEther(balance))

        const campaignMin = Number(formatEther(campaign.minInvestment))
        const campaignMax = Number(formatEther(campaign.maxInvestment))

        const campaignStats = this.campaignService.stats(campaign)

        const userInvestGap = this.floorDecimals(campaignMax - alreadyInvested)

        const max = Math.min(userInvestGap, this.floorDecimals(campaignStats.valueToInvest))
        const min = Math.min(alreadyInvested > 0 ? 0 : campaignMin, userInvestGap, max)

        return {
          min, max,
          walletBalance,
          userInvestGap,
        }
      }),
      tap(stats => {
        if (stats.min === stats.max) this.investmentForm.setValue({amount: stats.min})
      }),
      shareReplay(1),
    )

    this.investmentForm = this.fb.group({
      amount: [0, [], [this.validAmount.bind(this)]],
    })
  }

  private floorDecimals(value: number): number {
    return Math.floor(value * 100) / 100
  }

  private validAmount(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.preInvestData$.pipe(take(1),
      map(data => {
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
    return combineLatest([
      this.campaign$,
    ]).pipe(take(1),
      switchMap(([campaign]) => this.stablecoinService.getAllowance(campaign.contractAddress)),
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
    return combineLatest([
      this.campaign$,
    ]).pipe(take(1),
      switchMap(([campaign]) => this.stablecoinService.approveAmount(
        campaign.contractAddress, amount,
      )),
    )
  }

  backToEdit() {
    this.investStateSub.next(InvestState.Editing)
  }

  invest() {
    return combineLatest([
      this.campaign$,
    ]).pipe(take(1),
      switchMap(([campaign]) => this.campaignService.invest(
        campaign.contractAddress,
        this.investmentForm.value.amount,
      )),
      switchMap(() => this.router.navigate(['/portfolio'])),
    )
  }
}

enum InvestState {
  Editing,
  InReview
}

interface PreInvestData {
  min: number,
  max: number,
  walletBalance: number
  userInvestGap: number
}
