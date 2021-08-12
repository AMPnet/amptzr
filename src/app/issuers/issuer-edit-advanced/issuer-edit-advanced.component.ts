import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, from, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {ActivatedRoute} from '@angular/router'
import {SessionQuery} from '../../session/state/session.query'
import {IpfsService} from '../../shared/services/ipfs/ipfs.service'
import {SignerService} from '../../shared/services/signer.service'
import {DialogService} from '../../shared/services/dialog.service'
import {switchMap, tap} from 'rxjs/operators'

@Component({
  selector: 'app-issuer-edit-advanced',
  templateUrl: './issuer-edit-advanced.component.html',
  styleUrls: ['./issuer-edit-advanced.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuerEditAdvancedComponent {
  issuerAddress = this.route.snapshot.params.id

  issuerRefreshSub = new BehaviorSubject<{ isLazy: boolean }>({isLazy: false})
  issuer$: Observable<WithStatus<IssuerWithInfo>>

  changeWalletApproverForm: FormGroup

  constructor(private route: ActivatedRoute,
              private issuerService: IssuerService,
              private sessionQuery: SessionQuery,
              private ipfsService: IpfsService,
              private signerService: SignerService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.changeWalletApproverForm = this.fb.group({
      address: ['', Validators.required],
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
          this.changeWalletApproverForm.reset()
          this.changeWalletApproverForm.setValue({
            ...this.changeWalletApproverForm.value,
            address: issuer.value.walletApprover || '',
          })
        }
      }),
    )
  }

  changeWalletApprover() {
    return this.issuerService.changeWalletApprover(
      this.issuerAddress, this.changeWalletApproverForm.value.address,
    ).pipe(
      tap(() => this.issuerRefreshSub.next({isLazy: true})),
      switchMap(() => this.dialogService.info('Wallet approver changed successfully!', false)),
    )
  }
}
