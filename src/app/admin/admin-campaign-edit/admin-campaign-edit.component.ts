import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Observable } from 'rxjs'
import { withStatus, WithStatus } from '../../shared/utils/observables'
import { ActivatedRoute } from '@angular/router'
import { switchMap, tap } from 'rxjs/operators'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { quillMods } from 'src/app/shared/utils/quill'
import { DialogService } from '../../shared/services/dialog.service'
import { RouterService } from '../../shared/services/router.service'
import {
  CampaignService,
  CampaignWithInfo,
} from '../../shared/services/blockchain/campaign/campaign.service'
import { NameService } from '../../shared/services/blockchain/name.service'
import { dateToIsoString } from '../../shared/utils/date'
import { ReturnFrequency } from '../../../../types/ipfs/campaign'
import { AdminIssuerEditComponent } from '../admin-issuer-edit/admin-issuer-edit.component'
import { CampaignFlavor } from '../../shared/services/blockchain/flavors'
import { PhysicalInputService } from '../../shared/services/physical-input.service'

@Component({
  selector: 'app-admin-campaign-edit',
  templateUrl: './admin-campaign-edit.component.html',
  styleUrls: ['./admin-campaign-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignEditComponent {
  campaign$: Observable<WithStatus<CampaignWithInfo>>
  isAdvancedMode$ = this.physicalInputService.altKeyActive$

  updateForm: FormGroup
  updateInfoForm: FormGroup
  newsUrls: FormArray
  updateOwnerAddressForm: FormGroup

  quillMods = quillMods

  readonly returnFrequencyNames: { [key in ReturnFrequency]: string } = {
    [ReturnFrequency.MONTHLY]: 'Monthly',
    [ReturnFrequency.QUARTERLY]: 'Quarterly',
    [ReturnFrequency.SEMI_ANNUALLY]: 'Semi-annualy',
    [ReturnFrequency.ANNUALLY]: 'Annualy',
  }

  constructor(
    private campaignService: CampaignService,
    private nameService: NameService,
    private route: ActivatedRoute,
    private routerService: RouterService,
    private dialogService: DialogService,
    private physicalInputService: PhysicalInputService,
    private fb: FormBuilder
  ) {
    this.updateForm = this.fb.group(
      {
        name: ['', Validators.required],
        logo: [undefined],
        about: ['', Validators.required],
        description: ['', Validators.required],
        startDate: [undefined],
        endDate: [undefined],
        documentUpload: [undefined],
        newDocuments: [[]],
        oldDocuments: [[]],
        newsUrls: this.fb.array([]),
        isReturningProfitsToInvestors: [false, Validators.required],
        returnFrequency: [{ value: '', disabled: true }, Validators.required],
        isReturnValueFixed: [false, Validators.required],
        returnFrom: [
          { value: undefined, disabled: true },
          [Validators.required, Validators.min(0.01), Validators.max(1)],
        ],
        returnTo: [
          { value: undefined, disabled: true },
          [Validators.required, Validators.min(0.01), Validators.max(1)],
        ],
      },
      {
        validators: [
          AdminCampaignEditComponent.validReturnFromTo,
          AdminCampaignEditComponent.validDateRange,
        ],
      }
    )
    this.newsUrls = this.updateForm.get('newsUrls') as FormArray

    this.updateInfoForm = this.fb.group({
      info: ['', Validators.required],
    })
    this.updateOwnerAddressForm = this.fb.group({
      ownerAddress: [
        '',
        [Validators.required, AdminIssuerEditComponent.validAddress],
      ],
    })

    const campaignId = this.route.snapshot.params.campaignId
    this.campaign$ = this.nameService.getCampaign(campaignId).pipe(
      switchMap((campaign) =>
        withStatus(
          this.campaignService.getCampaignInfo(campaign.campaign, true)
        )
      ),
      tap((campaign) => {
        if (campaign.value) {
          const sameReturnRange =
            campaign.value.infoData.return.from ===
            campaign.value.infoData.return.to
          const noReturnToValue = !campaign.value.infoData.return.to
          const noReturnFromValue = !campaign.value.infoData.return.from
          const isReturningProfitsToInvestors =
            !!campaign.value.infoData.return.frequency
          const isReturnValueFixed =
            sameReturnRange || noReturnToValue || noReturnFromValue

          this.updateForm.reset()
          this.updateForm.setValue({
            ...this.updateForm.value,
            name: campaign.value.infoData.name || '',
            about: campaign.value.infoData.about || '',
            description: campaign.value.infoData.description || '',
            startDate: campaign.value.infoData.startDate?.split('T')[0],
            endDate: campaign.value.infoData.endDate?.split('T')[0],
            oldDocuments: campaign.value.infoData.documents || [],
            newDocuments: [],
            isReturningProfitsToInvestors: isReturningProfitsToInvestors,
            returnFrequency: campaign.value.infoData.return.frequency || '',
            returnFrom: campaign.value.infoData.return.from || 0,
            returnTo: campaign.value.infoData.return.to || 0,
            isReturnValueFixed: isReturnValueFixed,
          })

          this.updateInfoForm.setValue({
            info: campaign.value.info,
          })

          this.updateOwnerAddressForm.reset()
          this.updateOwnerAddressForm.setValue({
            ownerAddress: campaign.value.owner || '',
          })

          if (!campaign.value.infoData.return.from) {
            this.updateForm.controls.returnFrom.setValue(undefined)
          }

          if (!campaign.value.infoData.return.to) {
            this.updateForm.controls.returnTo.setValue(undefined)
          }

          this.newsUrls.clear()
          campaign.value.infoData.newsURLs.forEach((url) =>
            this.newsUrls.push(this.createNewsUrlControl(url))
          )

          this.toggleReturnFrequencyControls(isReturningProfitsToInvestors)
          this.toggleReturnToControls(isReturnValueFixed)

          this.newsUrls.markAsPristine()
          this.updateForm.markAsPristine()
        }
      })
    )
  }

  toggleReturnFrequencyControls(value: boolean) {
    if (value) {
      this.updateForm.controls.returnFrequency.enable()
      this.updateForm.controls.returnFrom.enable()

      if (!this.updateForm.value.isReturnValueFixed) {
        this.updateForm.controls.returnTo.enable()
      }
    } else {
      this.updateForm.controls.returnFrequency.disable()
      this.updateForm.controls.returnFrom.disable()
      this.updateForm.controls.returnTo.disable()
    }
  }

  toggleReturnToControls(value: boolean) {
    if (!value && this.updateForm.value.isReturningProfitsToInvestors) {
      this.updateForm.controls.returnTo.enable()
    } else {
      this.updateForm.controls.returnTo.disable()
    }
  }

  markDescriptionAsDirty() {
    this.updateForm.get('description')?.markAsDirty()
  }

  onDocumentFilesAdded(newDocuments: File[]) {
    const documents = this.updateForm.value.newDocuments.concat(newDocuments)
    this.updateForm.controls.newDocuments.setValue(documents)
  }

  removeOldDocumentFile(index: number) {
    this.updateForm.value.oldDocuments.splice(index, 1)
    this.updateForm.markAsDirty()
  }

  removeNewDocumentFile(index: number) {
    this.updateForm.value.newDocuments.splice(index, 1)
    this.updateForm.markAsDirty()
  }

  newsUrlsControls() {
    return this.newsUrls.controls as FormControl[]
  }

  addNewsUrl() {
    this.newsUrls.push(this.createNewsUrlControl(''))
  }

  removeNewsUrl(index: number) {
    this.newsUrls.removeAt(index)
    this.newsUrls.markAsDirty()
  }

  update(campaign: CampaignWithInfo) {
    return () => {
      return this.campaignService
        .uploadInfo(
          {
            name: this.updateForm.value.name,
            photo: this.updateForm.value.logo?.[0],
            about: this.updateForm.value.about,
            description: this.updateForm.value.description,
            startDate: dateToIsoString(this.updateForm.value.startDate),
            endDate: dateToIsoString(this.updateForm.value.endDate),
            documents: this.updateForm.value.oldDocuments,
            newDocuments: this.updateForm.value.newDocuments,
            return: this.createCampaignReturnObject(),
            newsURLs: this.newsUrls.value,
          },
          campaign.infoData
        )
        .pipe(
          switchMap((uploadRes) =>
            this.campaignService.updateInfo(
              campaign.contractAddress,
              uploadRes.path
            )
          ),
          switchMap(() =>
            this.dialogService.success({
              message: 'Campaign has been updated.',
            })
          ),
          switchMap(() =>
            this.routerService.navigate(['..'], { relativeTo: this.route })
          )
        )
    }
  }

  updateInfo(campaign: CampaignWithInfo) {
    return () => {
      return this.campaignService
        .updateInfo(campaign.contractAddress, this.updateInfoForm.value.info)
        .pipe(
          switchMap(() =>
            this.dialogService.success({
              message: 'Campaign info has been updated.',
            })
          ),
          switchMap(() =>
            this.routerService.navigate(['..'], { relativeTo: this.route })
          )
        )
    }
  }

  updateOwnerAddress(
    campaign: CampaignWithInfo,
    flavor: CampaignFlavor | string
  ) {
    return () => {
      return this.campaignService
        .changeOwner(
          campaign.contractAddress,
          this.updateOwnerAddressForm.value.ownerAddress,
          flavor as CampaignFlavor
        )
        .pipe(
          switchMap(() =>
            this.dialogService.success({
              message: 'The owner has been changed.',
            })
          ),
          tap(() =>
            this.routerService.navigate([`/admin/assets/${campaign.asset}`])
          )
        )
    }
  }

  private createNewsUrlControl(value: string) {
    return this.fb.control(value, [
      Validators.required,
      Validators.pattern('[^\\s]*'),
    ])
  }

  private createCampaignReturnObject(): {
    frequency?: ReturnFrequency
    from?: number
    to?: number
  } {
    if (this.updateForm.value.isReturningProfitsToInvestors) {
      if (this.updateForm.value.isReturnValueFixed) {
        return {
          frequency: this.updateForm.value.returnFrequency,
          from: this.updateForm.value.returnFrom,
        }
      }

      return {
        frequency: this.updateForm.value.returnFrequency,
        from: this.updateForm.value.returnFrom,
        to: this.updateForm.value.returnTo,
      }
    }

    return {}
  }

  private static validReturnFromTo(
    formGroup: FormGroup
  ): ValidationErrors | null {
    if (formGroup.value.isReturningProfitsToInvestors) {
      const returnFrom = formGroup.value.returnFrom
      if (returnFrom <= 0 || returnFrom > 1) {
        return { invalidReturnFrom: true }
      }

      if (!formGroup.value.isReturnValueFixed) {
        const returnTo = formGroup.value.returnTo
        if (returnTo <= 0 || returnTo > 1) {
          return { invalidReturnTo: true }
        }

        if (returnFrom >= returnTo) {
          return { invalidReturnFromToRange: true }
        }
      }
    }

    return null
  }

  private static validDateRange(formGroup: FormGroup): ValidationErrors | null {
    const startDate = formGroup.value.startDate
    const endDate = formGroup.value.endDate
    if (!!startDate && !!endDate && startDate > endDate) {
      return { invalidDateRange: true }
    }

    return null
  }
}
