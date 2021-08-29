import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, Observable} from 'rxjs'
import {FormBuilder, FormGroup} from '@angular/forms'
import {ActivatedRoute} from '@angular/router'
import {switchMap, tap} from 'rxjs/operators'
import {WithStatus, withStatus} from '../../../shared/utils/observables'
import {IpfsService} from '../../../shared/services/ipfs/ipfs.service'
import {DialogService} from '../../../shared/services/dialog.service'
import {SignerService} from '../../../shared/services/signer.service'
import {AssetService, AssetWithInfo} from '../../../shared/services/blockchain/asset.service'
import {SessionQuery} from '../../../session/state/session.query'

@Component({
  selector: 'app-asset-edit',
  templateUrl: './asset-edit.component.html',
  styleUrls: ['./asset-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetEditComponent {
  assetAddress = this.route.snapshot.params.id

  assetRefreshSub = new BehaviorSubject<{ isLazy: boolean }>({isLazy: false})
  asset$: Observable<WithStatus<AssetWithInfo>>

  updateForm: FormGroup

  constructor(private route: ActivatedRoute,
              private assetService: AssetService,
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
          this.assetService.getAssetWithInfo(this.assetAddress, true),
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

  update(asset: AssetWithInfo) {
    return () => {
      return this.assetService.uploadInfo(
        this.updateForm.value.logo?.[0],
        this.updateForm.value.description,
        asset,
      ).pipe(
        switchMap(uploadRes => this.assetService.updateInfo(this.assetAddress, uploadRes.path)),
        tap(() => this.assetRefreshSub.next({isLazy: true})),
        switchMap(() => this.dialogService.info('Asset successfully updated!', false)),
      )
    }
  }
}
