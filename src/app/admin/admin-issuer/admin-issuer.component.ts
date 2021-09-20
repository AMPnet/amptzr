import {ChangeDetectionStrategy, Component} from '@angular/core'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {Observable} from 'rxjs'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {FtAssetService} from '../../shared/services/blockchain/ft-asset.service'
import {filter, map, mergeMap} from 'rxjs/operators'
import {ReportService} from '../../shared/services/backend/report.service'

@Component({
  selector: 'app-admin',
  templateUrl: './admin-issuer.component.html',
  styleUrls: ['./admin-issuer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIssuerComponent {
  issuer$: Observable<WithStatus<IssuerWithInfo>>
  assets$: Observable<WithStatus<AssetWithInfo[]>>
  stableCoinSymbol: string

  constructor(private issuerService: IssuerService,
              private stableCoinService: StablecoinService,
              private assetService: AssetService,
              private ftAssetService: FtAssetService,
              private reportService: ReportService) {
    this.issuer$ = withStatus(this.issuerService.issuer$)
    this.stableCoinSymbol = this.stableCoinService.symbol

    const issuerContractAddress$ = this.issuer$.pipe(
      filter(issuerRes => !!issuerRes.value),
      map(issuerRes => issuerRes.value!),
      map(issuer => issuer.contractAddress),
    )
    this.assets$ = issuerContractAddress$.pipe( // TODO: fetch all assets via query service
      mergeMap(issuerContractAddress => withStatus(this.assetService.getAssets(issuerContractAddress))),
    )
  }

  downloadAdminInvestorsReport() {
    return this.reportService.downloadAdminInvestorsReport()
  }
}
