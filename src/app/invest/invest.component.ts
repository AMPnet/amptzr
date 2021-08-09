import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors} from '@angular/forms'
import {BehaviorSubject, combineLatest, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../shared/utils/observables'
import {CampaignService, CampaignWithInfo} from '../shared/services/blockchain/campaign.service'
import {filter, map, shareReplay, switchMap, take, tap} from 'rxjs/operators'
import {ActivatedRoute} from '@angular/router'
import {StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {utils} from 'ethers'

@Component({
  selector: 'app-invest',
  templateUrl: './invest.component.html',
  styleUrls: ['./invest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestComponent {
  investState = InvestState

  campaign$: Observable<WithStatus<CampaignWithInfo>>
  balance$ = withStatus(
    this.stablecoinService.balance$.pipe(
      shareReplay(1),
    ),
  )

  investStateSub = new BehaviorSubject<InvestState>(InvestState.Editing)
  investState$ = this.investStateSub.asObservable()

  investmentForm: FormGroup

  constructor(private fb: FormBuilder,
              private campaignService: CampaignService,
              private stablecoinService: StablecoinService,
              private route: ActivatedRoute) {
    const campaignID = this.route.snapshot.params.id

    this.campaign$ = withStatus(
      this.campaignService.getAddressByName(campaignID).pipe(
        switchMap(address => this.campaignService.getCampaignWithInfo(address)),
        shareReplay(1),
      ),
    )

    this.investmentForm = this.fb.group({
      amount: [0, [], [this.validAmount.bind(this)]],
    })
  }

  private validAmount(control: AbstractControl): Observable<ValidationErrors | null> {
    return combineLatest([
      this.campaign$.pipe(filter(res => !!res.value)),
      this.balance$.pipe(filter(res => !!res.value)),
    ]).pipe(take(1),
      map(([campaign, balance]) => {
        const minInvestment = utils.formatEther(campaign.value!.minInvestment)
        const maxInvestment = utils.formatEther(campaign.value!.maxInvestment)
        const walletBalance = utils.formatEther(balance.value!)
        const amount = control.value

        if (!amount) {
          return {amountEmpty: true}
        } else if (amount < minInvestment) {
          return {amountTooLow: true}
        } else if (amount > maxInvestment) {
          return {amountTooHigh: true}
        } else if (amount > walletBalance) {
          return {walletBalanceTooLow: true}
        }

        return null
      }),
      tap(() => ɵmarkDirty(this)),
    )
  }

  goToReview() {
    this.investStateSub.next(InvestState.InReview)
  }

  backToEdit() {
    this.investStateSub.next(InvestState.Editing)
  }
}

enum InvestState {
  Editing,
  InReview
}
