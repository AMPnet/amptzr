import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core"
import {DatePipe} from '@angular/common'
import {CampaignService, CampaignWithInfo} from '../../services/blockchain/campaign/campaign.service'
import {CampaignFlavor} from '../../services/blockchain/flavors'
import {map} from 'rxjs/operators'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../utils/observables'

@Component({
  selector: 'app-funding-progress',
  templateUrl: './funding-progress.component.html',
  styleUrls: ['./funding-progress.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundingProgressComponent implements OnInit {
  @Input() campaign!: CampaignWithInfo
  progressData$!: Observable<WithStatus<ProgressData>>

  constructor(private campaignService: CampaignService,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.progressData$ = withStatus(
      this.campaignService.stats(
        this.campaign.contractAddress, this.campaign.flavor as CampaignFlavor,
      ).pipe(
        map(stats => {
          const raisedPercentage = stats.valueTotal !== 0 ?
            stats.valueInvested / stats.valueTotal : 0

          const softCapPercentage = stats.valueTotal !== 0 ?
            stats.softCap / stats.valueTotal : 0

          return {
            raised: stats.valueInvested,
            raisedPercentage: raisedPercentage,
            total: stats.valueTotal,
            softCap: stats.softCap,
            softCapPercentage: softCapPercentage,
          }
        }),
      )
    )
  }

  dateRange(campaign: CampaignWithInfo) {
    if (!!campaign.infoData.startDate && !!campaign.infoData.endDate) {
      return `${this.formatDate(campaign.infoData.startDate)} - ${this.formatDate(campaign.infoData.endDate)}`
    }

    if (!!campaign.infoData.startDate) {
      return `From ${this.formatDate(campaign.infoData.startDate)}`
    }

    if (!!campaign.infoData.endDate) {
      return `Until ${this.formatDate(campaign.infoData.endDate)}`
    }

    return ''
  }

  private formatDate(value?: string): string | null {
    return this.datePipe.transform(value, 'mediumDate')
  }
}

interface ProgressData {
  raised: number,
  raisedPercentage: number,
  total: number,
  softCap: number,
  softCapPercentage: number,
}
