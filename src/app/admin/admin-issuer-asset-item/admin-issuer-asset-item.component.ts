import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'

@Component({
  selector: 'app-admin-issuer-asset-item',
  templateUrl: './admin-issuer-asset-item.component.html',
  styleUrls: ['./admin-issuer-asset-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIssuerAssetItemComponent implements OnInit {
  @Input() asset!: AssetWithInfo

  campaigns$!: Observable<WithStatus<CampaignWithInfo[]>>

  constructor(private campaignService: CampaignService) {
  }

  ngOnInit(): void {
    // TODO: fetch campaigns via query service
    this.campaigns$ = withStatus(this.campaignService.getCampaigns(this.asset.contractAddress))
  }
}
