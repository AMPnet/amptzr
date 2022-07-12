import { ChangeDetectionStrategy, Component } from '@angular/core'
import { combineLatest, Observable, of } from 'rxjs'
import { StablecoinService } from '../../shared/services/blockchain/stablecoin.service'
import { withStatus, WithStatus } from '../../shared/utils/observables'
import { filter, map, switchMap } from 'rxjs/operators'
import { ReportService } from '../../shared/services/backend/report.service'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../../shared/services/blockchain/asset/asset.service'
import {
  IssuerService,
  IssuerWithInfo,
} from '../../shared/services/blockchain/issuer/issuer.service'
import { QueryService } from '../../shared/services/blockchain/query.service'
import {
  IssuerBasicService,
  IssuerBasicState,
} from '../../shared/services/blockchain/issuer/issuer-basic.service'
import { PhysicalInputService } from '../../shared/services/physical-input.service'

@Component({
  selector: 'app-admin',
  templateUrl: './admin-issuer.component.html',
  styleUrls: ['./admin-issuer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIssuerComponent {
  issuer$: Observable<WithStatus<IssuerView>>

  assets$: Observable<WithStatus<CommonAssetWithInfo[]>>
  stableCoinSymbol: string

  altKeyActive$ = this.physicalInputService.altKeyActive$

  constructor(
    private issuerService: IssuerService,
    private stablecoin: StablecoinService,
    private assetService: AssetService,
    private physicalInputService: PhysicalInputService,
    private issuerBasicService: IssuerBasicService,
    private queryService: QueryService,
    private reportService: ReportService
  ) {
    this.issuer$ = withStatus(
      this.issuerService.issuer$.pipe(
        switchMap((issuer) =>
          this.issuerBasicService
            .getStateFromCommon(issuer)
            .pipe(map((issuerBasic) => ({ ...issuer, issuerBasic })))
        )
      )
    )

    this.stableCoinSymbol = this.stablecoin.config.symbol

    const issuerContractAddress$ = this.issuer$.pipe(
      filter((issuerRes) => !!issuerRes.value),
      map((issuerRes) => issuerRes.value!),
      map((issuer) => issuer.contractAddress)
    )

    this.assets$ = issuerContractAddress$.pipe(
      switchMap((address) =>
        withStatus(
          this.queryService
            .getAssetsForIssuerAddress(address)
            .pipe(
              switchMap((assets) =>
                assets.length > 0
                  ? combineLatest(
                      assets.map((asset) =>
                        this.assetService.getAssetInfo(asset.asset)
                      )
                    )
                  : of([])
              )
            )
        )
      )
    )
  }

  downloadAdminInvestorsReport() {
    return this.reportService.downloadAdminInvestorsReport()
  }
}

type IssuerView = IssuerWithInfo & { issuerBasic: IssuerBasicState | undefined }
