import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, Observable} from 'rxjs'
import {FormBuilder, FormGroup} from '@angular/forms'
import {ActivatedRoute} from '@angular/router'
import {switchMap, tap} from 'rxjs/operators'
import {WithStatus, withStatus} from '../../../shared/utils/observables'
import {IpfsService} from '../../../shared/services/ipfs/ipfs.service'
import {DialogService} from '../../../shared/services/dialog.service'
import {SignerService} from '../../../shared/services/signer.service'
import {SessionQuery} from '../../../session/state/session.query'
import {FtAssetService, FtAssetWithInfo} from '../../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-ft-asset-edit',
  templateUrl: './ft-asset-edit.component.html',
  styleUrls: ['./ft-asset-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FtAssetEditComponent {
  assetAddress = this.route.snapshot.params.id

  assetRefreshSub = new BehaviorSubject<{ isLazy: boolean }>({isLazy: false})
  asset$: Observable<WithStatus<FtAssetWithInfo>>

  updateForm: FormGroup

  constructor(private route: ActivatedRoute,
              private ftAssetService: FtAssetService,
              private sessionQuery: SessionQuery,
              private ipfsService: IpfsService,
              private signerService: SignerService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      logo: [undefined],
      description: [''],
    })

    this.asset$ = this.assetRefreshSub.asObservable().pipe(
      switchMap(refresh =>
        withStatus(
          this.ftAssetService.getAssetWithInfo(this.assetAddress, true),
          {hideLoading: refresh.isLazy},
        ),
      ),
      tap(asset => {
        if (asset.value) {
          this.updateForm.reset()
          this.updateForm.setValue({
            ...this.updateForm.value,
            description: asset.value.description || '',
          })
        }
      }),
    )
  }

  update(asset: FtAssetWithInfo) {
    return () => {
      return this.ftAssetService.uploadInfo(
        this.updateForm.value.logo?.[0],
        this.updateForm.value.description,
        asset,
      ).pipe(
        switchMap(uploadRes => this.ftAssetService.updateInfo(this.assetAddress, uploadRes.path)),
        tap(() => this.assetRefreshSub.next({isLazy: true})),
        switchMap(() => this.dialogService.info('Asset successfully updated!', false)),
      )
    }
  }
}
