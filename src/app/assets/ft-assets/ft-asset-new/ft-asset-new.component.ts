import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {ActivatedRoute} from '@angular/router'
import {switchMap} from 'rxjs/operators'
import {DialogService} from '../../../shared/services/dialog.service'
import {StablecoinService} from '../../../shared/services/blockchain/stablecoin.service'
import {SignerService} from '../../../shared/services/signer.service'
import {RouterService} from '../../../shared/services/router.service'
import {FtAssetService} from '../../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-ft-asset-new',
  templateUrl: './ft-asset-new.component.html',
  styleUrls: ['./ft-asset-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FtAssetNewComponent {
  issuer = this.route.snapshot.params.id
  createForm: FormGroup

  constructor(private ftAssetService: FtAssetService,
              private signerService: SignerService,
              private router: RouterService,
              private route: ActivatedRoute,
              private dialogService: DialogService,
              private stablecoin: StablecoinService,
              private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      ansName: ['', Validators.required],
      logo: [undefined, Validators.required],
      description: ['', Validators.required],
      initialTokenSupply: [0, Validators.required],
      symbol: ['', [Validators.required, Validators.maxLength(10)]],
      whitelistRequiredForRevenueClaim: [false, Validators.required],
      whitelistRequiredForLiquidationClaim: [false, Validators.required],
    })
  }

  create() {
    return this.ftAssetService.uploadInfo(
      this.createForm.value.logo?.[0],
      this.createForm.value.description,
    ).pipe(
      switchMap(uploadRes => this.ftAssetService.create({
        issuer: this.issuer,
        ansName: this.createForm.value.ansName,
        name: this.createForm.get('name')!.value,
        initialTokenSupply: this.stablecoin.parse(this.createForm.get('initialTokenSupply')!.value, 18),
        symbol: this.createForm.get('symbol')!.value,
        whitelistRequiredForRevenueClaim: this.createForm.get('whitelistRequiredForRevenueClaim')!.value,
        whitelistRequiredForLiquidationClaim: this.createForm.get('whitelistRequiredForLiquidationClaim')!.value,
        info: uploadRes.path,
      })),
      switchMap(assetAddress => this.dialogService.info('Asset successfully created!', false).pipe(
        switchMap(() => this.router.router.navigate([`/ft_assets/${assetAddress}`])),
      )),
    )
  }
}
