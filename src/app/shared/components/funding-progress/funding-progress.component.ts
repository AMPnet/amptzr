import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core"
import {CampaignService, CampaignWithInfo} from '../../services/blockchain/campaign.service'
import {DatePipe} from '@angular/common'

@Component({
  selector: 'app-funding-progress',
  templateUrl: './funding-progress.component.html',
  styleUrls: ['./funding-progress.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundingProgressComponent implements OnInit {
  @Input() campaign!: CampaignWithInfo

  progressData: ProgressData | undefined

  constructor(private campaignService: CampaignService,
              private datePipe: DatePipe,) {
  }

  ngOnInit() {
    const stats = this.campaignService.stats(this.campaign)

    const raisedPercentage = stats.valueTotal !== 0 ?
      stats.valueInvested / stats.valueTotal : 0

    const softCapPercentage = stats.valueTotal !== 0 ?
      stats.softCap / stats.valueTotal : 0

    this.progressData = {
      raised: stats.valueInvested,
      raisedPercentage: raisedPercentage,
      total: stats.valueTotal,
      softCap: stats.softCap,
      softCapPercentage: softCapPercentage,
    }
  }

  dateRange() {
    if (!!this.campaign.startDate && !!this.campaign.endDate) {
      return `${this.formatDate(this.campaign.startDate)} - ${this.formatDate(this.campaign.endDate)}`
    }

    if (!!this.campaign.startDate) {
      return `From ${this.formatDate(this.campaign.startDate)}`
    }

    if (!!this.campaign.endDate) {
      return `Until ${this.formatDate(this.campaign.endDate)}`
    }

    return ''
  }

  private formatDate(value?: string): string | null {
    return this.datePipe.transform(value, "mediumDate")
  }
}

interface ProgressData {
  raised: number,
  raisedPercentage: number,
  total: number,
  softCap: number,
  softCapPercentage: number,
}
