import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {AssetWithInfo} from '../../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../../shared/services/blockchain/ft-asset.service'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../../shared/utils/observables'
import {CampaignService, CampaignWithInfo} from '../../../shared/services/blockchain/campaign.service'

@Component({
  selector: 'app-admin-asset-list-item',
  templateUrl: './admin-asset-list-item.component.html',
  styleUrls: ['./admin-asset-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAssetListItemComponent implements OnInit {
  @Input() asset!: AssetWithInfo | FtAssetWithInfo
  @Input() assetType!: 'asset' | 'ft-asset'

  campaigns$!: Observable<WithStatus<CampaignWithInfo[]>>

  constructor(private campaignService: CampaignService,) {
  }

  ngOnInit(): void {
    this.campaigns$ = withStatus(this.campaignService.getCampaigns(this.asset.contractAddress))
  }
}
