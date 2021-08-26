import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from '@angular/core'
import {CampaignService, CampaignStats, CampaignWithInfo} from "../shared/services/blockchain/campaign.service"
import {PercentPipe} from "@angular/common"

@Component({
  selector: 'app-offer-investment-info',
  templateUrl: './offer-investment-info.component.html',
  styleUrls: ['./offer-investment-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferInvestmentInfoComponent implements OnInit {
  @Input() display: 'narrow' | 'wide' | 'return-only' = 'narrow'
  @Input() offer!: CampaignWithInfo
  stats!: CampaignStats

  @HostBinding('class.hidden') hidden: boolean = false

  constructor(private percentPipe: PercentPipe,
              private campaignService: CampaignService) {
  }

  ngOnInit() {
    this.stats = this.campaignService.stats(this.offer)
    this.hidden = this.offer.cancelled || this.offer.finalized ||
      !(this.hasReturnRate || this.shouldShowMin || this.shouldShowMax)
  }

  get hasReturnRate(): boolean {
    return !!this.offer.return.from
  }

  get returnRateRange(): string {
    if (this.offer.return.from === this.offer.return.to || !this.offer.return.to) {
      return this.percentPipe.transform(this.offer.return.from) || ''
    }

    return `${this.percentPipe.transform(this.offer.return.from)} - ${this.percentPipe.transform(this.offer.return.to)}`
  }

  get returnRateFrequency(): string {
    return this.offer.return.frequency ?? 'annual'
  }

  get shouldShowMin() {
    return this.stats.userMin > 0
  }

  get shouldShowMax() {
    return this.display === 'wide' && this.stats.userMax < this.stats.valueTotal
  }
}
