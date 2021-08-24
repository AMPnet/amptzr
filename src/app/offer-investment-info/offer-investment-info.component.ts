import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {CampaignWithInfo} from "../shared/services/blockchain/campaign.service"
import {PercentPipe} from "@angular/common"

@Component({
  selector: 'app-offer-investment-info',
  templateUrl: './offer-investment-info.component.html',
  styleUrls: ['./offer-investment-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferInvestmentInfoComponent {
  @Input() display: 'narrow' | 'wide' | 'return-only' = 'narrow'
  @Input() offer!: CampaignWithInfo

  constructor(private percentPipe: PercentPipe,) {
  }

  hasReturnRate(): boolean {
    return !!this.offer.return.from
  }

  returnRateRange(): string | null {
    if (this.offer.return.from === this.offer.return.to || !this.offer.return.to) {
      return this.percentPipe.transform(this.offer.return.from)
    }

    return `${this.percentPipe.transform(this.offer.return.from)} - ${this.percentPipe.transform(this.offer.return.to)}`
  }

  returnRateFrequency(): string {
    return this.offer.return.frequency ?? 'annual'
  }
}
