import {ChangeDetectionStrategy, Component} from '@angular/core'
import {from, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {ActivatedRoute} from '@angular/router'
import {SessionQuery} from '../../session/state/session.query'
import {switchMap, tap} from 'rxjs/operators'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {IpfsService} from '../../shared/services/ipfs/ipfs.service'
import {SignerService} from '../../shared/services/signer.service'

@Component({
  selector: 'app-issuer-edit',
  templateUrl: './issuer-edit.component.html',
  styleUrls: ['./issuer-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuerEditComponent {
  issuerAddress = this.route.snapshot.params.id
  issuer$: Observable<WithStatus<IssuerWithInfo>>
  updateForm: FormGroup

  constructor(private route: ActivatedRoute,
              private issuerService: IssuerService,
              private sessionQuery: SessionQuery,
              private ipfsService: IpfsService,
              private signerService: SignerService,
              private fb: FormBuilder) {
    this.issuer$ = this.sessionQuery.provider$.pipe(
      switchMap(provider =>
        withStatus(from(this.issuerService.getIssuerWithInfo(this.issuerAddress, provider))),
      ),
      tap(issuer => issuer.value && this.updateForm.setValue({
        ...this.updateForm.value,
        name: issuer.value.name,
      })),
    )

    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      logo: [undefined],
    })
  }

  update(issuer: IssuerWithInfo) {
    return () => {
      return this.issuerService.uploadInfo(
        this.updateForm.get('name')!.value,
        this.updateForm.get('logo')!.value?.[0],
        issuer,
      ).pipe(
        switchMap(uploadRes => this.issuerService.updateInfo(this.issuerAddress, uploadRes.path))
      )
    }
  }
}
