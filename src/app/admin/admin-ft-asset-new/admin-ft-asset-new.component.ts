import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {switchMap, tap} from 'rxjs/operators'
import {StablecoinService} from '../../shared/services/blockchain/stablecoin.service'
import {RouterService} from '../../shared/services/router.service'
import {DialogService} from '../../shared/services/dialog.service'
import {FtAssetService} from '../../shared/services/blockchain/ft-asset.service'
import {getWindow} from '../../shared/utils/browser'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'

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
      ansName: ['', [Validators.required, Validators.pattern('[A-Za-z0-9][A-Za-z0-9_-]*')]],
      logo: [undefined, Validators.required],
      description: [''],
      initialTokenSupply: [0, [Validators.required, Validators.min(1)]],
      symbol: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('[A-Za-z0-9]*')]],
      whitelistRequiredForRevenueClaim: [false, Validators.required],
      whitelistRequiredForLiquidationClaim: [false, Validators.required],
    })
  }

  get assetUrl() {
    return getWindow().location.origin + this.issuerPathPipe.transform(`/ft_assets/`)
  }

  create() {
    return this.ftAssetService.uploadInfo(
      this.createForm.value.logo?.[0],
      this.createForm.value.description || '',
    ).pipe(
      switchMap(uploadRes => this.ftAssetService.create({
        issuer: this.preferenceQuery.issuer.address,
        ansName: this.createForm.value.ansName,
        name: this.createForm.value.name,
        initialTokenSupply: this.stablecoinService.parse(this.createForm.value.initialTokenSupply, 18),
        symbol: this.createForm.value.symbol,
        whitelistRequiredForRevenueClaim: this.createForm.value.whitelistRequiredForRevenueClaim,
        whitelistRequiredForLiquidationClaim: this.createForm.value.whitelistRequiredForLiquidationClaim,
        info: uploadRes.path,
      })),
      switchMap(() => this.dialogService.info('Transferable asset successfully created!', false)),
      tap(() => this.routerService.navigate([`/admin/ft_assets/${this.createForm.value.ansName}`])),
    )
  }
}