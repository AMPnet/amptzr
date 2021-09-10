import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, from, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {ActivatedRoute} from '@angular/router'
import {SessionQuery} from '../../session/state/session.query'
import {switchMap, tap} from 'rxjs/operators'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {IpfsService} from '../../shared/services/ipfs/ipfs.service'
import {SignerService} from '../../shared/services/signer.service'
import {DialogService} from '../../shared/services/dialog.service'

@Component({
  selector: 'app-issuer-edit',
  templateUrl: './issuer-edit.component.html',
  styleUrls: ['./issuer-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuerEditComponent {
  issuerAddress = this.route.snapshot.params.id

  issuerRefreshSub = new BehaviorSubject<{ isLazy: boolean }>({isLazy: false})
  issuer$: Observable<WithStatus<IssuerWithInfo>>

  updateForm: FormGroup

  constructor(private route: ActivatedRoute,
              private issuerService: IssuerService,
              private sessionQuery: SessionQuery,
              private ipfsService: IpfsService,
              private signerService: SignerService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      logo: [undefined],
    })

    this.issuer$ = this.issuerRefreshSub.asObservable().pipe(
      switchMap(refresh =>
        withStatus(
          from(this.issuerService.getIssuerWithInfo(this.issuerAddress)),
          {hideLoading: refresh.isLazy},
        ),
      ),
      tap(issuer => {
        if (issuer.value) {
          this.updateForm.reset()
          this.updateForm.setValue({
            ...this.updateForm.value,
            name: issuer.value.name || '',
          })
        }
      }),
    )
  }

  update(issuer: IssuerWithInfo) {
    return () => {
      return this.issuerService.uploadInfo(
        this.updateForm.value.name,
        this.updateForm.value.logo?.[0],
        '',
        issuer,
      ).pipe(
        switchMap(uploadRes => this.issuerService.updateInfo(this.issuerAddress, uploadRes.path)),
        tap(() => this.issuerRefreshSub.next({isLazy: true})),
        switchMap(() => this.dialogService.info('Issuer successfully updated!', false)),
      )
    }
  }
}
