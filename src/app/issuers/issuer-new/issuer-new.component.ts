import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {IssuerService} from '../../shared/services/blockchain/issuer.service'
import {switchMap} from 'rxjs/operators'
import {SignerService} from '../../shared/services/signer.service'
import {Router} from '@angular/router'
import {DialogService} from '../../shared/services/dialog.service'

@Component({
  selector: 'app-issuer-new',
  templateUrl: './issuer-new.component.html',
  styleUrls: ['./issuer-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuerNewComponent {
  createForm: FormGroup

  constructor(private issuerService: IssuerService,
              private signerService: SignerService,
              private router: Router,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      logo: [undefined, Validators.required],
    })
  }

  create() {
    return this.issuerService.uploadInfo(
      this.createForm.get('name')!.value,
      this.createForm.get('logo')!.value?.[0],
    ).pipe(
      switchMap(uploadRes => this.issuerService.create(uploadRes.path)),
      switchMap(issuerAddress => this.dialogService.info('Issuer successfully created!', false).pipe(
        switchMap(() => this.router.navigate([`/issuers/${issuerAddress}`])),
      )),
    )
  }
}
