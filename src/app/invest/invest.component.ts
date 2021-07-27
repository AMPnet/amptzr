import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { BehaviorSubject, combineLatest, Observable, of, zip } from 'rxjs'
import { map, startWith, tap } from 'rxjs/operators'

@Component({
  selector: 'app-invest',
  templateUrl: './invest.component.html',
  styleUrls: ['./invest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestComponent {

  project = new BehaviorSubject<InvestProjectModel>({
    title: "Supercool Invest-O-Pia",
    walletBalance: 50000,
    roi: "8%",
    description: "This is a small change, but a big move for us. 140 was an arbitrary choice based on the 160 character SMS limit. Proud of how thoughtful the team has been in solving a real problem people have when trying to tweet. And at the same time maintaining our brevity, speed, and essence!",
    minInvestment: 10000,
    maxInvestment: 100000
  })
  project$ = this.project.asObservable()

  investmentState = new BehaviorSubject<InvestmentState>(InvestmentState.Editing)
  investmentState$ = this.investmentState.asObservable()
  investAmountState = InvestmentAmountState;

  investmentAmountForm = this.fb.group({ investmentAmount: ['', Validators.required] })

  investmentAmountValueChanges$ = this.investmentAmountForm.controls['investmentAmount'].valueChanges

  investmentAmountState$ =
    this.investmentAmountValueChanges$
      .pipe(map((amount) => { return this.handleStateChange(parseInt(amount)) }), startWith(this.handleStateChange(0)))

  isInReview$ = this.investmentState.asObservable().pipe(map((x) => { return x == InvestmentState.InReview }))

  isEditingDisabled$ =
    combineLatest([this.investmentAmountState$, this.investmentState$])
      .pipe(
        map(([amountState, investmentState]) => {
          return !(amountState.state == InvestmentAmountState.Valid) || (investmentState == InvestmentState.InReview)
        })
      )

  constructor(private fb: FormBuilder) { }


  handleStateChange(amount: number): InvestmentAmountModel {

    let model = this.project.value
    let investmentAmountFieldIsDirty = this.investmentAmountForm.controls['investmentAmount'].dirty

    if (!investmentAmountFieldIsDirty) { return { amount: amount, state: InvestmentAmountState.Empty } }
    if (amount < model.minInvestment) { return { amount: amount, state: InvestmentAmountState.InvestmentAmountTooLow } }
    if (amount > model.maxInvestment) { return { amount: amount, state: InvestmentAmountState.InvestmentAmountTooHigh } }
    if (amount > model.walletBalance) { return { amount: amount, state: InvestmentAmountState.NotEnoughFunds } }

    return { amount: amount, state: InvestmentAmountState.Valid }
  }

  nextButtonClicked() {
    this.investmentState.next(InvestmentState.InReview)
    this.setAmountInputEnabled(false)
  }

  cancelButtonClicked() {
    this.investmentState.next(InvestmentState.Editing)
    this.setAmountInputEnabled(true)
  }

  setAmountInputEnabled(enabled: boolean) {
    let control = this.investmentAmountForm.controls['investmentAmount']
    enabled ? control.enable() : control.disable()
  }
}

interface InvestProjectModel {
  title: string,
  walletBalance: number,
  roi: string,
  description: string,
  minInvestment: number,
  maxInvestment: number
}

enum InvestmentState {
  Editing,
  InReview
}

interface InvestmentAmountModel {
  amount: number,
  state: InvestmentAmountState
}

export enum InvestmentAmountState {
  Valid,
  Empty,
  InvestmentAmountTooHigh,
  InvestmentAmountTooLow,
  NotEnoughFunds
}