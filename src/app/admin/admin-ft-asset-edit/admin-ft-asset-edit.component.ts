import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup} from '@angular/forms'
import {BehaviorSubject, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {RouterService} from '../../shared/services/router.service'
import {DialogService} from '../../shared/services/dialog.service'
import {switchMap, tap} from 'rxjs/operators'
import {ActivatedRoute} from '@angular/router'
import {FtAssetService, FtAssetWithInfo} from '../../shared/services/blockchain/ft-asset.service'

@Component({
  selector: 'app-ft-admin-asset-edit',
  templateUrl: './admin-ft-asset-edit.component.html',
  styleUrls: ['./admin-ft-asset-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFtAssetEditComponent {
  assetSub = new BehaviorSubject<void>(undefined)
  asset$: Observable<WithStatus<FtAssetWithInfo>>

  updateForm: FormGroup

  constructor(private route: ActivatedRoute,
              private routerService: RouterService,
              private ftAssetService: FtAssetService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      logo: [undefined],
      description: [''],
    })

    const assetId = this.route.snapshot.params.id

    this.asset$ = this.assetSub.asObservable().pipe(
      switchMap(() => withStatus(
        this.ftAssetService.getAddressByName(assetId).pipe(
          switchMap(address => this.ftAssetService.getAssetWithInfo(address, true)),
        ),
      )),
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
        switchMap(uploadRes => this.ftAssetService.updateInfo(asset.contractAddress, uploadRes.path)),
        switchMap(() => this.dialogService.info('Asset successfully updated!', false)),
        tap(() => this.routerService.navigate([`/admin/ft_assets/${asset.ansName}`])),
      )
    }
  }
}
