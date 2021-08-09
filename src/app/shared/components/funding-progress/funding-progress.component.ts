import {ChangeDetectionStrategy, Component, Input} from "@angular/core"

@Component({
  selector: 'app-funding-progress',
  templateUrl: './funding-progress.component.html',
  styleUrls: ['./funding-progress.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundingProgressComponent {
  @Input() fundsRaised: number = 0
  @Input() fundsRequired: number = 0
  @Input() startDate: string = ''
  @Input() endDate: string = ''

  raisedPercentage(): number {
    if (this.fundsRequired === 0) {
      return 100
    }

    return Math.min(100 * this.fundsRaised / this.fundsRequired, 100)
  }
}
