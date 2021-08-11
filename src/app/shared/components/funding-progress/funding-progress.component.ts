import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core"
import {CampaignService, CampaignState, CampaignWithInfo} from '../../services/blockchain/campaign.service'

@Component({
  selector: 'app-funding-progress',
  templateUrl: './funding-progress.component.html',
  styleUrls: ['./funding-progress.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundingProgressComponent implements OnInit {
  @Input() campaign!: CampaignWithInfo

  progressData: ProgressData | undefined

  constructor(private campaignService: CampaignService) {
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
}

interface ProgressData {
  raised: number,
  raisedPercentage: number,
  total: number,
  softCap: number,
  softCapPercentage: number,
}
