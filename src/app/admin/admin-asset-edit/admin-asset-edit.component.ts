import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup} from '@angular/forms'
import {BehaviorSubject, Observable} from 'rxjs'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {RouterService} from '../../shared/services/router.service'
import {DialogService} from '../../shared/services/dialog.service'
import {switchMap, tap} from 'rxjs/operators'
import {ActivatedRoute} from '@angular/router'
import {resolveAddress} from '../../shared/utils/ethersjs'

@Component({
  selector: 'app-admin-asset-edit',
  templateUrl: './admin-asset-edit.component.html',
  styleUrls: ['./admin-asset-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetEditComponent {
  assetSub = new BehaviorSubject<void>(undefined)
  asset$: Observable<WithStatus<AssetWithInfo>>

  updateForm: FormGroup

  constructor(private route: ActivatedRoute,
              private routerService: RouterService,
              private assetService: AssetService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      logo: [undefined],
    })

    const assetId = this.route.snapshot.params.id

    this.asset$ = this.assetSub.asObservable().pipe(
      switchMap(() => withStatus(
        resolveAddress(assetId, this.assetService.getAddressByName(assetId)).pipe(
          switchMap(address => this.assetService.getAssetWithInfo(address, true)),
        ),
      )),
      tap(asset => {
        if (asset.value) {
          this.updateForm.reset()
          this.updateForm.setValue({
            ...this.updateForm.value,
          })
        }
      }),
    )
  }

  update(asset: AssetWithInfo) {
    return () => {
      return this.assetService.uploadInfo(
        this.updateForm.value.logo?.[0], '', asset,
      ).pipe(
        switchMap(uploadRes => this.assetService.updateInfo(asset.contractAddress, uploadRes.path)),
        switchMap(() => this.dialogService.info('Asset successfully updated!', false)),
        tap(() => this.routerService.navigate([`/admin/assets/${asset.ansName}`])),
      )
    }
  }
}
