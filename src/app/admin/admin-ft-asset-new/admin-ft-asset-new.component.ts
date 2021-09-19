import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {switchMap, tap} from 'rxjs/operators'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {RouterService} from '../../shared/services/router.service'
import {DialogService} from '../../shared/services/dialog.service'
import {FtAssetService} from '../../shared/services/blockchain/ft-asset.service'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {v4 as uuidV4} from 'uuid'

@Component({
  selector: 'app-admin-ft-asset-new',
  templateUrl: './admin-ft-asset-new.component.html',
  styleUrls: ['./admin-ft-asset-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFtAssetNewComponent {
  createForm: FormGroup

  constructor(private ftAssetService: FtAssetService,
              private preferenceQuery: PreferenceQuery,
              private stablecoinService: StablecoinService,
              private dialogService: DialogService,
              private routerService: RouterService,
              private issuerPathPipe: IssuerPathPipe,
              private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      logo: [undefined, Validators.required],
      initialTokenSupply: [0, [Validators.required, Validators.min(1)]],
      symbol: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('[A-Za-z0-9]*')]],
      whitelistRequiredForRevenueClaim: [false, Validators.required],
      whitelistRequiredForLiquidationClaim: [false, Validators.required],
    })
  }

  create() {
    return this.ftAssetService.uploadInfo(
      this.createForm.value.logo?.[0],
    ).pipe(
      switchMap(uploadRes => this.ftAssetService.create({
        issuer: this.preferenceQuery.issuer.address,
        ansName: uuidV4(),
        name: this.createForm.value.name,
        initialTokenSupply: this.stablecoinService.parse(this.createForm.value.initialTokenSupply, 18),
        symbol: this.createForm.value.symbol,
        whitelistRequiredForRevenueClaim: this.createForm.value.whitelistRequiredForRevenueClaim,
        whitelistRequiredForLiquidationClaim: this.createForm.value.whitelistRequiredForLiquidationClaim,
        info: uploadRes.path,
      })),
      switchMap(assetAddress => this.dialogService.info('Transferable asset successfully created!', false).pipe(
        tap(() => this.routerService.navigate([`/admin/ft_assets/${assetAddress}`])),
      )),
    )
  }
}
