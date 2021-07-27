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

  project$                        = this.project.asObservable()
  componentState                  = new BehaviorSubject<ComponentState>(ComponentState.Editing)
  investmentState$                = this.componentState.asObservable()
  investmentAmountForm            = this.fb.group({ investmentAmount: ['', Validators.required] })
  investmentAmountValueChanges$   = this.investmentAmountForm.controls['investmentAmount'].valueChanges
  investAmountStateType           = InvestmentAmountState

  investmentAmountState$ =
    this.investmentAmountValueChanges$
      .pipe(map((amount) => { return this.handleAmountValueChange(parseInt(amount)) }), 
            startWith(this.handleAmountValueChange(0)))

  investmentAmount$ = 
    this.investmentAmountValueChanges$.pipe(map((amount) => { return parseInt(amount) }))

  isInReview$ = 
    this.componentState.asObservable().pipe(
      map((x) => { return x == ComponentState.InReview }))

  isEditingDisabled$ = this.investmentAmountState$.pipe(
    map((state) => state !== InvestmentAmountState.Valid)
  )

  constructor(private fb: FormBuilder) { }

  handleAmountValueChange(amount: number): InvestmentAmountState {

    let model = this.project.value
    let investmentAmountFieldIsDirty = this.investmentAmountForm.controls['investmentAmount'].dirty

    if (!investmentAmountFieldIsDirty) { return InvestmentAmountState.Empty }
    if (amount < model.minInvestment) { return InvestmentAmountState.InvestmentAmountTooLow }
    if (amount > model.maxInvestment) { return InvestmentAmountState.InvestmentAmountTooLow }
    if (amount > model.walletBalance) {  return InvestmentAmountState.NotEnoughFunds }

    return InvestmentAmountState.Valid
  }

  nextButtonClicked() {
    this.componentState.next(ComponentState.InReview)
    this.setAmountInputEnabled(false)
  }

  cancelButtonClicked() {
    this.componentState.next(ComponentState.Editing)
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

enum ComponentState {
  Editing,
  InReview
}

export enum InvestmentAmountState {
  Valid,
  Empty,
  InvestmentAmountTooHigh,
  InvestmentAmountTooLow,
  NotEnoughFunds
}
