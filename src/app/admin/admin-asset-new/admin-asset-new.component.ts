import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { switchMap, tap } from 'rxjs/operators'
import { StablecoinService } from '../../shared/services/blockchain/stablecoin.service'
import { RouterService } from '../../shared/services/router.service'
import { DialogService } from '../../shared/services/dialog.service'
import { IssuerPathPipe } from '../../shared/pipes/issuer-path.pipe'
import { v4 as uuidV4 } from 'uuid'
import { AssetService } from '../../shared/services/blockchain/asset/asset.service'
import { AssetFlavor } from '../../shared/services/blockchain/flavors'
import { ConversionService } from '../../shared/services/conversion.service'

@Component({
  selector: 'app-admin-asset-new',
  templateUrl: './admin-asset-new.component.html',
  styleUrls: ['./admin-asset-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetNewComponent {
  createForm: FormGroup

  assetFlavor = AssetFlavor
  assetFactory = this.preferenceQuery.network.tokenizerConfig.assetFactory

  constructor(
    private assetService: AssetService,
    private preferenceQuery: PreferenceQuery,
    private stablecoinService: StablecoinService,
    private dialogService: DialogService,
    private routerService: RouterService,
    private issuerPathPipe: IssuerPathPipe,
    private conversion: ConversionService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      logo: [undefined, Validators.required],
      initialTokenSupply: [0, [Validators.required, Validators.min(1)]],
      symbol: ['', [Validators.required, Validators.maxLength(20)]],
      whitelistRequiredForRevenueClaim: [false],
      whitelistRequiredForLiquidationClaim: [false],
      flavor: [this.assetFlavor.BASIC, Validators.required],
    })
  }

  create() {
    return this.assetService.uploadInfo(this.createForm.value.logo?.[0]).pipe(
      switchMap((uploadRes) =>
        this.assetService.create(
          {
            issuer: this.preferenceQuery.issuer.address,
            slug: uuidV4(),
            name: this.createForm.value.name,
            initialTokenSupply: this.conversion.toToken(
              this.createForm.value.initialTokenSupply
            ),
            symbol: this.createForm.value.symbol,
            whitelistRequiredForRevenueClaim:
              this.createForm.value.whitelistRequiredForRevenueClaim,
            whitelistRequiredForLiquidationClaim:
              this.createForm.value.whitelistRequiredForLiquidationClaim,
            info: uploadRes.path,
          },
          this.createForm.value.flavor
        )
      ),
      switchMap((assetAddress) =>
        this.dialogService
          .success({
            message: 'Asset has been created.',
          })
          .pipe(
            tap(() =>
              this.routerService.navigate([`/admin/assets/${assetAddress}`])
            )
          )
      )
    )
  }

  isAssetWhitelistable(flavor: AssetFlavor | string): boolean {
    return [AssetFlavor.BASIC, AssetFlavor.TRANSFERABLE].includes(
      flavor as AssetFlavor
    )
  }
}
