import {ChangeDetectionStrategy, Component} from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-invest',
  templateUrl: './invest.component.html',
  styleUrls: ['./invest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestComponent {

  project = new BehaviorSubject<InvestProjectModel>({
    title: "Supercool Invest-O-Pia",
    walletBalance: 500000,
    roi: "8% - 11%",
    description: "This is a small change, but a big move for us. 140 was an arbitrary choice based on the 160 character SMS limit. Proud of how thoughtful the team has been in solving a real problem people have when trying to tweet. And at the same time maintaining our brevity, speed, and essence!"
  })
  project$ = this.project.asObservable()

  investmentAmount = new BehaviorSubject<number>(90000)
  investmentAmount$ = this.investmentAmount.asObservable()

  investmentState = new BehaviorSubject<InvestmentState>(InvestmentState.Editing)
  investmentState$ = this.investmentState.asObservable()

  constructor() {
  }
}

interface InvestProjectModel {
  title: string,
  walletBalance: number,
  roi: string, 
  description: string
}

enum InvestmentState {
  Editing,
  InReview
}