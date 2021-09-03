import {ChangeDetectionStrategy, Component} from '@angular/core'
import {IssuerService, IssuerWithInfo} from '../shared/services/blockchain/issuer.service'
import {Observable} from 'rxjs'
import {StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {AssetService, AssetWithInfo} from '../shared/services/blockchain/asset.service'
import {withStatus, WithStatus} from '../shared/utils/observables'
import {FtAssetService, FtAssetWithInfo} from '../shared/services/blockchain/ft-asset.service'
import {map, mergeMap} from 'rxjs/operators'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  issuer$: Observable<IssuerWithInfo>
  assets$: Observable<WithStatus<AssetWithInfo[]>>
  ftAssets$: Observable<WithStatus<FtAssetWithInfo[]>>
  stableCoinSymbol: string

  constructor(private issuerService: IssuerService,
              private stableCoinService: StablecoinService,
              private assetService: AssetService,
              private ftAssetService: FtAssetService) {
    this.issuer$ = this.issuerService.issuer$
    this.stableCoinSymbol = this.stableCoinService.symbol

    const issuerContractAddress$ = this.issuer$.pipe(
      map(issuer => issuer.contractAddress),
    )
    this.assets$ = issuerContractAddress$.pipe(
      mergeMap(issuerContractAddress => withStatus(this.assetService.getAssets(issuerContractAddress))),
    )
    this.ftAssets$ = issuerContractAddress$.pipe(
      mergeMap(issuerContractAddress => withStatus(this.ftAssetService.getAssets(issuerContractAddress))),
    )
  }
}
