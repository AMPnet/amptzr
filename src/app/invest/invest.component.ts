import {ChangeDetectionStrategy, Component} from '@angular/core'
import {PreInvestData} from '../shared/services/invest.service'
import {CampaignWithInfo} from '../shared/services/blockchain/campaign/campaign.service'
import {BigNumber} from 'ethers'

@Component({
  selector: 'app-invest',
  templateUrl: './invest.component.html',
  styleUrls: ['./invest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestComponent {
  // state$!: Observable<InvestmentState>
  // stateWithStatus$!: Observable<WithStatus<InvestmentState>>
  //
  // investmentForm: FormGroup
  //
  // constructor(private fb: FormBuilder,
  //             private campaignService: CampaignService,
  //             private nameService: NameService,
  //             private sessionQuery: SessionQuery,
  //             private stablecoin: StablecoinService,
  //             private dialogService: DialogService,
  //             private investService: InvestService,
  //             private router: RouterService,
  //             private route: ActivatedRoute) {
  //   const campaignId = this.route.snapshot.params.id
  //   const campaignCommon$ = this.nameService.getCampaign(campaignId).pipe(
  //     shareReplay(1),
  //   )
  //
  //   const campaign$: Observable<CampaignWithInfo> = campaignCommon$.pipe(
  //     switchMap(campaignCommon => this.campaignService.getCampaignInfo(campaignCommon.campaign)),
  //     shareReplay(1),
  //   )
  //
  //   const preInvestData$: Observable<PreInvestData> = campaignCommon$.pipe(
  //     switchMap(address => this.investService.preInvestData(address)),
  //     tap(stats => {
  //       if (stats.min === stats.max) this.investmentForm.setValue({stablecoinAmount: stats.min})
  //     }),
  //     shareReplay(1),
  //   )
  //
  //   this.state$ = combineLatest([
  //     of(this.stablecoin.symbol),
  //     this.stablecoin.balance$,
  //     campaign$,
  //     preInvestData$
  //   ]).pipe(
  //     map(([stablecoinSymbol, stablecoinBalance, campaign, preInvestData]) => ({
  //       stablecoinSymbol, stablecoinBalance, campaign, preInvestData
  //     }))
  //   )
  //   this.stateWithStatus$ = withStatus(this.state$)
  //
  //   this.investmentForm = this.fb.group({
  //     stablecoinAmount: [''],
  //     tokenAmount: [''],
  //   }, {
  //     asyncValidators: this.amountValidator.bind(this)
  //   })
  // }
  //
  // private validAmount(control: AbstractControl): Observable<ValidationErrors | null> {
  //   return combineLatest([this.state$]).pipe(take(1),
  //     map(([data]) => {
  //       const amount = control.value
  //
  //       if (data.preInvestData.userInvestGap === 0) {
  //         return {userMaxReached: true}
  //       } else if (data.preInvestData.max === 0) {
  //         return {campaignMaxReached: true}
  //       } else if (data.preInvestData.walletBalance === 0) {
  //         return {walletBalanceTooLow: true}
  //       } else if (!amount) {
  //         return {amountEmpty: true}
  //       } else if (amount < data.min) {
  //         return {amountTooLow: true}
  //       } else if (amount > data.max) {
  //         return {amountTooHigh: true}
  //       } else if (amount > data.walletBalance) {
  //         return {walletBalanceTooLow: true}
  //       }
  //
  //       return null
  //     }),
  //     tap(() => ɵmarkDirty(this)),
  //   )
  // }
  //
  // goToReview() {
  //   return this.getAllowance().pipe(
  //     switchMap(allowance => allowance < this.investmentForm.value.amount ?
  //       this.approveFlow(this.investmentForm.value.amount) : of(allowance),
  //     ),
  //     // tap(() => this.investStateSub.next(InvestState.InReview)),
  //   )
  // }
  //
  // private getAllowance(): Observable<number> {
  //   return combineLatest([this.campaign$]).pipe(take(1),
  //     switchMap(([campaign]) => this.stablecoin.getAllowance(campaign.contractAddress)),
  //   )
  // }
  //
  // private approveFlow(amount: number) {
  //   const approveAmount$ = this.approveAmount(amount)
  //   switch (this.sessionQuery.getValue().authProvider) {
  //     case AuthProvider.MAGIC:
  //       return approveAmount$
  //     default:
  //       return this.dialogService.info(
  //         'You will be asked to sign the transaction to allow investment from your wallet.',
  //       ).pipe(
  //         switchMap(res => res ? approveAmount$ : throwError(() => 'USER_DISMISSED_APPROVE_FLOW')),
  //       )
  //   }
  // }
  //
  // private approveAmount(amount: number) {
  //   return combineLatest([this.campaign$]).pipe(take(1),
  //     switchMap(([campaign]) => this.stablecoin.approveAmount(
  //       campaign.contractAddress, amount,
  //     )),
  //   )
  // }
  //
  // backToEdit() {
  //   this.investStateSub.next(InvestState.Editing)
  // }
  //
  // invest() {
  //   return combineLatest([this.campaign$]).pipe(take(1),
  //     switchMap(([campaign]) => this.campaignService.invest(
  //       campaign.contractAddress,
  //       campaign.flavor as CampaignFlavor,
  //       this.investmentForm.value.amount,
  //     )),
  //     switchMap(() => this.router.navigate(['/portfolio'])),
  //   )
  // }
  //
  // private amountValidator(control: AbstractControl): Observable<ValidationErrors | null> {
  //   return combineLatest([this.state$]).pipe(take(1),
  //     map(([data]) => {
  //       const stablecoinAmount = this.stablecoin.parse(control.value.stablecoinAmount)
  //       const stockAmount = Number(control.value.stockAmount)
  //
  //       if (stablecoinAmount.lte(0)) {
  //         return {stablecoinAmountNonPositive: true}
  //       } else if (stablecoinAmount.gt(data.stablecoinBalance)) {
  //         return {walletBalanceTooLow: true}
  //       } else if (stockAmount < 1) {
  //         return {stockAmountTooLow: true}
  //       }
  //
  //       return null
  //     }),
  //     tap(() => ɵmarkDirty(this)),
  //   )
  // }
}

interface InvestmentState {
  stablecoinSymbol: string,
  stablecoinBalance: BigNumber,
  campaign: CampaignWithInfo,
  preInvestData: PreInvestData,
}
