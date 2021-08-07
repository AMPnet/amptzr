import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {SignerService} from '../../shared/services/signer.service'
import {ActivatedRoute} from '@angular/router'
import {DialogService} from '../../shared/services/dialog.service'
import {switchMap} from 'rxjs/operators'
import {utils} from 'ethers'
import {CampaignService} from '../../shared/services/blockchain/campaign.service'
import {TokenPrice} from '../../shared/utils/token-price'
import {RouterService} from '../../shared/services/router.service'

@Component({
  selector: 'app-campaign-new',
  templateUrl: './campaign-new.component.html',
  styleUrls: ['./campaign-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignNewComponent {
  asset = this.route.snapshot.params.id
  createForm: FormGroup

  constructor(private campaignService: CampaignService,
              private signerService: SignerService,
              private router: RouterService,
              private route: ActivatedRoute,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      photo: [undefined, Validators.required],
      description: ['', Validators.required],
      initialPricePerToken: [0, Validators.required],
      softCap: [0, Validators.required],
      minInvestment: [0, Validators.required],
      maxInvestment: [0, Validators.required],
      whitelistRequired: [false, Validators.required],
    })
  }

  create() {
    return this.campaignService.uploadInfo({
      name: this.createForm.value.name,
      photo: this.createForm.value.photo?.[0],
      description: this.createForm.value.description,
    }).pipe(
      switchMap(uploadRes => this.campaignService.create({
        assetAddress: this.asset,
        initialPricePerToken: TokenPrice.format(this.createForm.value.initialPricePerToken),
        softCap: utils.parseEther(String(this.createForm.value.softCap)),
        minInvestment: utils.parseEther(String(this.createForm.value.minInvestment)),
        maxInvestment: utils.parseEther(String(this.createForm.value.maxInvestment)),
        whitelistRequired: this.createForm.value.whitelistRequired,
        info: uploadRes.path,
      })),
      switchMap(campaignAddress => this.dialogService.info('Campaign successfully created!', false).pipe(
        switchMap(() => this.router.navigate([`/campaigns/${campaignAddress}`])),
      )),
    )
  }
}
