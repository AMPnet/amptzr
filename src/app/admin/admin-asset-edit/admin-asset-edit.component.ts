import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { BehaviorSubject, Observable } from 'rxjs'
import { withStatus, WithStatus } from '../../shared/utils/observables'
import { RouterService } from '../../shared/services/router.service'
import { DialogService } from '../../shared/services/dialog.service'
import { switchMap, tap } from 'rxjs/operators'
import { ActivatedRoute } from '@angular/router'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../../shared/services/blockchain/asset/asset.service'
import { NameService } from '../../shared/services/blockchain/name.service'
import { AdminIssuerEditComponent } from '../admin-issuer-edit/admin-issuer-edit.component'
import { AssetFlavor } from '../../shared/services/blockchain/flavors'
import { PhysicalInputService } from '../../shared/services/physical-input.service'

@Component({
  selector: 'app-admin-asset-edit',
  templateUrl: './admin-asset-edit.component.html',
  styleUrls: ['./admin-asset-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetEditComponent {
  assetSub = new BehaviorSubject<void>(undefined)
  asset$: Observable<WithStatus<CommonAssetWithInfo>>

  updateForm: FormGroup
  updateOwnerAddressForm: FormGroup

  isAdvancedMode$ = this.physicalInputService.altKeyActive$

  constructor(
    private route: ActivatedRoute,
    private routerService: RouterService,
    private nameService: NameService,
    private assetService: AssetService,
    private dialogService: DialogService,
    private physicalInputService: PhysicalInputService,
    private fb: FormBuilder
  ) {
    this.updateForm = this.fb.group({
      logo: [undefined],
    })
    this.updateOwnerAddressForm = this.fb.group({
      ownerAddress: [
        '',
        [Validators.required, AdminIssuerEditComponent.validAddress],
      ],
    })

    const assetId = this.route.snapshot.params.id

    this.asset$ = this.assetSub.asObservable().pipe(
      switchMap(() =>
        withStatus(
          this.nameService
            .getAsset(assetId)
            .pipe(
              switchMap((asset) =>
                this.assetService.getAssetWithInfo(
                  asset.asset.contractAddress,
                  true
                )
              )
            )
        )
      ),
      tap((asset) => {
        if (asset.value) {
          this.updateForm.reset()
          this.updateForm.setValue({
            ...this.updateForm.value,
          })

          this.updateOwnerAddressForm.reset()
          this.updateOwnerAddressForm.setValue({
            ownerAddress: asset.value.owner || '',
          })
        }
      })
    )
  }

  update(asset: CommonAssetWithInfo) {
    return () => {
      return this.assetService
        .uploadInfo(this.updateForm.value.logo?.[0], '', asset.infoData)
        .pipe(
          switchMap((uploadRes) =>
            this.assetService.updateInfo(asset.contractAddress, uploadRes.path)
          ),
          switchMap(() =>
            this.dialogService.success({
              message: 'Asset has been updated.',
            })
          ),
          tap(() =>
            this.routerService.navigate([
              `/admin/assets/${asset.contractAddress}`,
            ])
          )
        )
    }
  }

  updateOwnerAddress(asset: CommonAssetWithInfo, flavor: AssetFlavor | string) {
    return () => {
      return this.assetService
        .changeOwner(
          asset.contractAddress,
          this.updateOwnerAddressForm.value.ownerAddress,
          flavor as AssetFlavor
        )
        .pipe(
          switchMap(() =>
            this.dialogService.success({
              message: 'The owner has been changed.',
            })
          ),
          tap(() => this.routerService.navigate(['/admin/issuer']))
        )
    }
  }
}
