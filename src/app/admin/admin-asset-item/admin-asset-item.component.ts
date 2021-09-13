import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'

@Component({
  selector: 'app-admin-asset-item',
  templateUrl: './admin-asset-item.component.html',
  styleUrls: ['./admin-asset-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetItemComponent implements OnInit {
  @Input() asset!: AssetWithInfo | FtAssetWithInfo
  @Input() assetType!: 'asset' | 'ft-asset'
  @Input() type!: 'view-screen' | 'edit-screen'

  campaigns$!: Observable<WithStatus<CampaignWithInfo[]>>

  constructor(private campaignService: CampaignService) {
  }

  ngOnInit(): void {
    this.campaigns$ = withStatus(this.campaignService.getCampaigns(this.asset.contractAddress))
  }

  get routerLink(): string {
    if (this.type === 'edit-screen') {
      return 'edit'
    }

    return this.assetType === 'asset' ? `/admin/assets/${this.asset.ansName}` : `/admin/ft_assets/${this.asset.ansName}`
  }
}
