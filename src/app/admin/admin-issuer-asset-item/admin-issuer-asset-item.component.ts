import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core'
import { combineLatest, Observable, of } from 'rxjs'
import { withStatus, WithStatus } from '../../shared/utils/observables'
import {
  CampaignService,
  CampaignWithInfo,
} from '../../shared/services/blockchain/campaign/campaign.service'
import { switchMap } from 'rxjs/operators'
import { QueryService } from '../../shared/services/blockchain/query.service'
import { CommonAssetWithInfo } from '../../shared/services/blockchain/asset/asset.service'

@Component({
  selector: 'app-admin-issuer-asset-item',
  templateUrl: './admin-issuer-asset-item.component.html',
  styleUrls: ['./admin-issuer-asset-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIssuerAssetItemComponent implements OnInit {
  @Input() asset!: CommonAssetWithInfo

  campaigns$!: Observable<WithStatus<CampaignWithInfo[]>>

  constructor(
    private campaignService: CampaignService,
    private queryService: QueryService
  ) {}

  ngOnInit(): void {
    this.campaigns$ = withStatus(
      this.queryService
        .getCampaignsForAssetAddress(this.asset.contractAddress)
        .pipe(
          switchMap((campaigns) =>
            campaigns.length > 0
              ? combineLatest(
                  campaigns.map((campaign) =>
                    this.campaignService.getCampaignInfo(campaign.campaign)
                  )
                )
              : of([])
          )
        )
    )
  }
}
