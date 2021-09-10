import {ChangeDetectionStrategy, Component} from '@angular/core'
import {combineLatest, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {BigNumber} from 'ethers'
import {ActivatedRoute} from '@angular/router'
import {map, switchMap} from 'rxjs/operators'
import {FtAssetService, FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-admin-ft-asset-campaign-new',
  templateUrl: './admin-ft-asset-campaign-new.component.html',
  styleUrls: ['./admin-ft-asset-campaign-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFtAssetCampaignNewComponent {
  assetData$: Observable<WithStatus<{
    asset: FtAssetWithInfo,
    balance: BigNumber,
  }>>

  constructor(private route: ActivatedRoute,
              private ftAssetService: FtAssetService) {
    const assetId = this.route.snapshot.params.id
    const asset$ = this.ftAssetService.getAddressByName(assetId).pipe(
      switchMap(address => this.ftAssetService.getAssetWithInfo(address, true)),
    )
    const tokenBalance$ = asset$.pipe(
      switchMap(asset => this.ftAssetService.balance(asset.contractAddress)),
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
