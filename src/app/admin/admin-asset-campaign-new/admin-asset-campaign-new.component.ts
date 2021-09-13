import {ChangeDetectionStrategy, Component} from '@angular/core'
import {combineLatest, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {BigNumber} from 'ethers'
import {ActivatedRoute} from '@angular/router'
import {map, switchMap} from 'rxjs/operators'

@Component({
  selector: 'app-admin-asset-campaign-new',
  templateUrl: './admin-asset-campaign-new.component.html',
  styleUrls: ['./admin-asset-campaign-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetCampaignNewComponent {
  assetData$: Observable<WithStatus<{
    asset: AssetWithInfo,
    balance: BigNumber,
  }>>

  constructor(private route: ActivatedRoute,
              public assetService: AssetService) {
    const assetId = this.route.snapshot.params.id
    const asset$ = this.assetService.getAddressByName(assetId).pipe(
      switchMap(address => this.assetService.getAssetWithInfo(address, true)),
    )
    const tokenBalance$ = asset$.pipe(
      switchMap(asset => this.assetService.balance(asset.contractAddress)),
    )

    this.assetData$ = withStatus(
      combineLatest([
        asset$,
        tokenBalance$,
      ]).pipe(
        map(([asset, balance]) => ({asset, balance})),
      ),
    )
  }
}
