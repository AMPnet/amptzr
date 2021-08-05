import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {SignerService} from '../../shared/services/signer.service'
import {ActivatedRoute, Router} from '@angular/router'
import {DialogService} from '../../shared/services/dialog.service'
import {switchMap} from 'rxjs/operators'
import {AssetService} from '../../shared/services/blockchain/asset.service'
import {utils} from 'ethers'

@Component({
  selector: 'app-asset-new',
  templateUrl: './asset-new.component.html',
  styleUrls: ['./asset-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetNewComponent {
  issuer = this.route.snapshot.params.id
  createForm: FormGroup

  constructor(private assetService: AssetService,
              private signerService: SignerService,
              private router: Router,
              private route: ActivatedRoute,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      logo: [undefined, Validators.required],
      description: ['', Validators.required],
      initialTokenSupply: [0, Validators.required],
      symbol: ['', [Validators.required, Validators.maxLength(10)]],
      whitelistRequiredForTransfer: [false, Validators.required],
    })
  }

  create() {
    return this.assetService.uploadInfo(
      this.createForm.get('logo')!.value?.[0],
      this.createForm.get('description')!.value,
    ).pipe(
      switchMap(uploadRes => this.assetService.create({
        issuer: this.issuer,
        name: this.createForm.get('name')!.value,
        initialTokenSupply: utils.parseEther(String(this.createForm.get('initialTokenSupply')!.value)),
        symbol: this.createForm.get('symbol')!.value,
        whitelistRequiredForTransfer: this.createForm.get('whitelistRequiredForTransfer')!.value,
        info: uploadRes.path,
      })),
      switchMap(assetAddress => this.dialogService.info('Asset successfully created!', false).pipe(
        switchMap(() => this.router.navigate([`/assets/${assetAddress}`])),
      )),
    )
  }
}
