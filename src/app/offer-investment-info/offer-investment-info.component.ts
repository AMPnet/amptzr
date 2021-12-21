import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from '@angular/core'
import {PercentPipe} from "@angular/common"
import {CampaignService, CampaignStats, CampaignWithInfo} from '../shared/services/blockchain/campaign/campaign.service'
import {Observable, of} from 'rxjs'
import {CampaignFlavor} from '../shared/services/blockchain/flavors'
import {CampaignBasicService, CampaignBasicState} from '../shared/services/blockchain/campaign/campaign-basic.service'
import {map, shareReplay, switchMap, tap} from 'rxjs/operators'
import {constants} from 'ethers'

@Component({
  selector: 'app-offer-investment-info',
  templateUrl: './offer-investment-info.component.html',
  styleUrls: ['./offer-investment-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferInvestmentInfoComponent implements OnInit {
  @Input() display: 'narrow' | 'wide' | 'return-only' = 'narrow'
  @Input() offer!: CampaignWithInfo
  stats$!: Observable<CampaignStats>
  hidden$!: Observable<boolean>

  campaignBasic$!: Observable<CampaignBasicState | undefined>

  @HostBinding('class.hidden') hidden: boolean = true

  constructor(private percentPipe: PercentPipe,
              private campaignService: CampaignService,
              private campaignBasicService: CampaignBasicService,
  ) {
  }

  ngOnInit() {
    this.stats$ = this.campaignService.stats(
      this.offer.contractAddress, this.offer.flavor as CampaignFlavor,
    ).pipe(
      shareReplay(1),
    )

    this.campaignBasic$ = of(this.offer).pipe(
      switchMap(campaign => this.campaignBasicService.getStateFromCommon(campaign)),
    )

    this.hidden$ = this.stats$.pipe(
      map(stats => this.offer.canceled || this.offer.finalized ||
        !(this.hasReturnRate || this.shouldShowMin(stats) || this.shouldShowMax(stats)),
      ),
      tap(hidden => this.hidden = hidden),
    )
  }

  get hasReturnRate(): boolean {
    return !!this.offer.infoData.return.from
  }

  get returnRateRange(): string {
    const from = this.offer.infoData.return.from
    const to = this.offer.infoData.return.to

    if (from === to || !to) {
      return this.formatPercent(from)
    }

    return `${this.formatPercent(from)} - ${this.formatPercent(to)}`
  }

  private formatPercent(value?: number): string {
    return this.percentPipe.transform(value, '1.0-2') || ''
  }

  shouldShowMin(stats: CampaignStats) {
    // TODO: should be set to userMin > 0
    //  this is a workaround for campaigns that are incorrectly set.
    return stats.userMin.gte(constants.One)
  }

  shouldShowMax(stats: CampaignStats) {
    return this.display === 'wide' && stats.userMax < stats.valueTotal
  }
}
