import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core"
import {DatePipe} from '@angular/common'
import {CampaignService, CampaignWithInfo} from '../../services/blockchain/campaign/campaign.service'
import {CampaignFlavor} from '../../services/blockchain/flavors'
import {map} from 'rxjs/operators'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../utils/observables'
import {constants} from 'ethers'
import {StablecoinBigNumber} from '../../services/blockchain/stablecoin.service'
import {ConversionService} from '../../services/conversion.service'

@Component({
  selector: 'app-funding-progress',
  templateUrl: './funding-progress.component.html',
  styleUrls: ['./funding-progress.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundingProgressComponent implements OnInit {
  @Input() campaign!: CampaignWithInfo
  progressData$!: Observable<WithStatus<ProgressData>>

  bigNumberConstants = constants

  constructor(private campaignService: CampaignService,
              private conversion: ConversionService,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.progressData$ = withStatus(
      this.campaignService.stats(
        this.campaign.contractAddress, this.campaign.flavor as CampaignFlavor,
      ).pipe(
        map(stats => this.calculateProgressData(
          stats.valueInvested, stats.softCap, stats.valueTotal,
        )),
      ),
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

  private calculateProgressData(
    valueInvested: StablecoinBigNumber,
    softCap: StablecoinBigNumber,
    valueTotal: StablecoinBigNumber,
  ) {
    // 1/ before tokens are transferred to the campaign
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(0)

    // 2/ not enough transferred to the campaign
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(200_000)

    // 3/ transferred just to ensure softCap
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(500_000)

    // 4/ transferred more than softCap
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(700_000)

    // 5/ transferred far more than softCap
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 6/ invested below softCap
    // valueInvested = this.conversion.toStablecoin(105_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 7/ invested just below softCap
    // valueInvested = this.conversion.toStablecoin(480_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 8/ invested exactly softCap
    // valueInvested = this.conversion.toStablecoin(500_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 9/ invested just above softCap
    // valueInvested = this.conversion.toStablecoin(505_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 10/ invested mid total
    // valueInvested = this.conversion.toStablecoin(1_200_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 11/ invested just below total
    // valueInvested = this.conversion.toStablecoin(1_950_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 12/ invested total
    // valueInvested = this.conversion.toStablecoin(2_000_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    let softCapPercentage = 0
    let raisedPercentageOfSoftCap = 0
    let raisedPercentageOfTotal = 0
    let isRaisedOverSoftCap = false

    if (!valueTotal.eq(constants.Zero)) {
      softCapPercentage = this.conversion.parseStablecoinToNumber(softCap) /
        this.conversion.parseStablecoinToNumber(valueTotal)
      raisedPercentageOfSoftCap = this.conversion.parseStablecoinToNumber(valueInvested) /
        this.conversion.parseStablecoinToNumber(softCap)
      raisedPercentageOfTotal = this.conversion.parseStablecoinToNumber(valueInvested) /
        this.conversion.parseStablecoinToNumber(valueTotal)

      if (valueInvested.gt(softCap)) isRaisedOverSoftCap = true
    }

    return {
      raised: valueInvested,
      softCap: softCap,
      total: valueTotal,
      softCapPercentage,
      raisedPercentageOfSoftCap,
      raisedPercentageOfTotal,
      isRaisedOverSoftCap,
    }
  }
}

interface ProgressData {
  raised: StablecoinBigNumber,
  softCap: StablecoinBigNumber,
  total: StablecoinBigNumber,
  softCapPercentage: number,
  raisedPercentageOfSoftCap: number,
  raisedPercentageOfTotal: number,
  isRaisedOverSoftCap: boolean,
}
