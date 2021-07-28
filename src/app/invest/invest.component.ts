import {ChangeDetectionStrategy, Component} from '@angular/core'
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn} from '@angular/forms'
import {BehaviorSubject} from 'rxjs'

@Component({
  selector: 'app-invest',
  templateUrl: './invest.component.html',
  styleUrls: ['./invest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestComponent {
  investState = InvestState

  projectSub = new BehaviorSubject<InvestProjectModel>({
    title: "Supercool Invest-O-Pia",
    walletBalance: 500,
    roi: "8%",
    description: "This is a small change, but a big move for us. 140 was an arbitrary choice based on the 160 character SMS limit. Proud of how thoughtful the team has been in solving a real problem people have when trying to tweet. And at the same time maintaining our brevity, speed, and essence!",
    minInvestment: 100,
    maxInvestment: 1000,
    imgSrc: "https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  })
  project$ = this.projectSub.asObservable()
  investStateSub = new BehaviorSubject<InvestState>(InvestState.Editing)
  investState$ = this.investStateSub.asObservable()

  investmentForm: FormGroup

  constructor(private fb: FormBuilder) {
    this.investmentForm = this.fb.group({
      amount: [0, [this.amountValidator()]],
    })
  }

  private amountValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const project = this.projectSub.value
      const amount = control.value

      if (!amount) {
        return {amountEmpty: true}
      } else if (amount < project.minInvestment) {
        return {amountTooLow: true}
      } else if (amount > project.maxInvestment) {
        return {amountTooHigh: true}
      } else if (amount > project.walletBalance) {
        return {walletBalanceTooLow: true}
      }

      return null
    }
  }

  goToReview() {
    this.investStateSub.next(InvestState.InReview)
  }

  backToEdit() {
    this.investStateSub.next(InvestState.Editing)
  }
}

interface InvestProjectModel {
  title: string,
  walletBalance: number,
  roi: string,
  description: string,
  minInvestment: number,
  maxInvestment: number,
  imgSrc: string
}

enum InvestState {
  Editing,
  InReview
}
