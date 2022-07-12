import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core'
import {
  CampaignService,
  CampaignWithInfo,
} from '../../services/blockchain/campaign/campaign.service'
import { CampaignFlavor } from '../../services/blockchain/flavors'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { withStatus, WithStatus } from '../../utils/observables'
import { constants } from 'ethers'
import { StablecoinBigNumber } from '../../services/blockchain/stablecoin.service'
import { ConversionService } from '../../services/conversion.service'

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

  constructor(
    private campaignService: CampaignService,
    private conversion: ConversionService
  ) {}

  ngOnInit() {
    // 1/ campaign opened
    // this.campaign.canceled = false
    // this.campaign.finalized = false

    // 2/ campaign canceled
    // this.campaign.canceled = true
    // this.campaign.finalized = false

    // 3/ campaign finalized
    // this.campaign.canceled = false
    // this.campaign.finalized = true

    this.progressData$ = withStatus(
      this.campaignService
        .stats(
          this.campaign.contractAddress,
          this.campaign.flavor as CampaignFlavor
        )
        .pipe(
          map((stats) =>
            this.calculateProgressData(
              stats.valueInvested,
              stats.softCap,
              stats.valueTotal
            )
          )
        )
    )
  }

  private calculateProgressData(
    valueInvested: StablecoinBigNumber,
    softCap: StablecoinBigNumber,
    valueTotal: StablecoinBigNumber
  ) {
    // Cases with softCap == 0
    // 1.1/ before tokens are transferred to the campaign
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(0)
    // valueTotal = this.conversion.toStablecoin(0)

    // 1.2/ tokens are transferred to the campaign
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(0)
    // valueTotal = this.conversion.toStablecoin(500_000)

    // 1.3/ users invested something
    // valueInvested = this.conversion.toStablecoin(400_000)
    // softCap = this.conversion.toStablecoin(0)
    // valueTotal = this.conversion.toStablecoin(500_000)

    // 1.4/ users invested all
    // valueInvested = this.conversion.toStablecoin(500_000)
    // softCap = this.conversion.toStablecoin(0)
    // valueTotal = this.conversion.toStablecoin(500_000)

    // Cases with softCap == valueTotal
    // 2.1/ before tokens are transferred to the campaign
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(0)

    // 2.2/ tokens are transferred to the campaign
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(500_000)

    // 3.3/ users invested something
    // valueInvested = this.conversion.toStablecoin(400_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(500_000)

    // 3.4/ users invested all
    // valueInvested = this.conversion.toStablecoin(500_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(500_000)

    // Cases with softCap < valueTotal
    // 4.1/ before tokens are transferred to the campaign
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(0)

    // 4.2/ not enough transferred to the campaign
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(200_000)

    // 4.3/ transferred just to ensure softCap
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(500_000)

    // 4.4/ transferred more than softCap
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(700_000)

    // 4.5/ transferred far more than softCap
    // valueInvested = this.conversion.toStablecoin(0)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 4.6/ invested below softCap
    // valueInvested = this.conversion.toStablecoin(105_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 4.7/ invested just below softCap
    // valueInvested = this.conversion.toStablecoin(480_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 4.8/ invested exactly softCap
    // valueInvested = this.conversion.toStablecoin(500_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 4.9/ invested just above softCap
    // valueInvested = this.conversion.toStablecoin(505_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 4.10/ invested mid total
    // valueInvested = this.conversion.toStablecoin(1_200_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 4.11/ invested just below total
    // valueInvested = this.conversion.toStablecoin(1_950_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    // 4.12/ invested total
    // valueInvested = this.conversion.toStablecoin(2_000_000)
    // softCap = this.conversion.toStablecoin(500_000)
    // valueTotal = this.conversion.toStablecoin(2_000_000)

    let target = softCap.eq(constants.Zero) ? valueTotal : softCap
    let raisedPercentage = 0
    let progressPercentage = 0
    let isStarted = false
    let isRaisedOverSoftCap = false
    let isFull = false

    if (valueTotal.gt(constants.Zero) && valueTotal.gte(softCap))
      isStarted = true

    if (!valueTotal.eq(constants.Zero)) {
      raisedPercentage =
        this.conversion.parseStablecoinToNumber(valueInvested) /
        this.conversion.parseStablecoinToNumber(target)

      progressPercentage = Math.min(raisedPercentage, 1)

      if (softCap.gt(constants.Zero) && valueInvested.gt(softCap))
        isRaisedOverSoftCap = true
      if (valueInvested.eq(valueTotal)) isFull = true
    }

    return {
      raised: valueInvested,
      softCap: softCap,
      total: valueTotal,
      target,
      raisedPercentage,
      progressPercentage,
      isRaisedOverSoftCap,
      isStarted,
      isFull,
    }
  }
}

interface ProgressData {
  raised: StablecoinBigNumber
  softCap: StablecoinBigNumber
  total: StablecoinBigNumber
  target: StablecoinBigNumber
  raisedPercentage: number
  progressPercentage: number
  isRaisedOverSoftCap: boolean
  isStarted: boolean
  isFull: boolean
}
