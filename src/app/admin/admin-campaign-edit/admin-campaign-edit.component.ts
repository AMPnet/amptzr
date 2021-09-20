import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {ActivatedRoute} from '@angular/router'
import {switchMap, tap} from 'rxjs/operators'
import {FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {ReturnFrequencies, ReturnFrequency} from 'types/ipfs/campaign'
import {quillMods} from 'src/app/shared/utils/quill'
import {DialogService} from '../../shared/services/dialog.service'
import {RouterService} from '../../shared/services/router.service'
import {resolveAddress} from '../../shared/utils/ethersjs'

@Component({
  selector: 'app-admin-campaign-edit',
  templateUrl: './admin-campaign-edit.component.html',
  styleUrls: ['./admin-campaign-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignEditComponent {
  campaign$: Observable<WithStatus<CampaignWithInfo>>

  updateForm: FormGroup
  newsUrls: FormArray

  quillMods = quillMods

  readonly ReturnFrequencies: ReturnFrequencies = ['monthly', 'quarterly', 'semi-annual', 'annual']
  readonly ReturnFrequencyNames = {
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'semi-annual': 'Semi-annualy',
    'annual': 'Annualy',
  }

  constructor(private campaignService: CampaignService,
              private route: ActivatedRoute,
              private routerService: RouterService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      logo: [undefined],
      about: ['', Validators.required],
      description: ['', Validators.required],
      startDate: [undefined, Validators.required],
      endDate: [undefined, Validators.required],
      documentUpload: [undefined],
      newDocuments: [[]],
      oldDocuments: [[]],
      newsUrls: this.fb.array([]),
      isReturningProfitsToInvestors: [false, Validators.required],
      returnFrequency: [{value: '', disabled: true}, Validators.required],
      isReturnValueFixed: [false, Validators.required],
      returnFrom: [{value: undefined, disabled: true}, [Validators.required, Validators.min(0.01), Validators.max(1)]],
      returnTo: [{value: undefined, disabled: true}, [Validators.required, Validators.min(0.01), Validators.max(1)]],
    }, {
      validators: [
        AdminCampaignEditComponent.validReturnFromTo,
        AdminCampaignEditComponent.validDateRange,
      ]
    })
    this.newsUrls = this.updateForm.get('newsUrls') as FormArray

    const campaignId = this.route.snapshot.params.campaignId
    // TODO: fix resolving address from name service
    this.campaign$ = resolveAddress(campaignId, this.campaignService.getAddressByName(campaignId)).pipe(
      switchMap(address => withStatus(this.campaignService.getCampaignWithInfo(address, true))),
      tap(campaign => {
        if (campaign.value) {
          const sameReturnRange = campaign.value.return.from === campaign.value.return.to
          const noReturnToValue = !campaign.value.return.to
          const noReturnFromValue = !campaign.value.return.from
          const isReturningProfitsToInvestors = !!campaign.value.return.frequency
          const isReturnValueFixed = sameReturnRange || noReturnToValue || noReturnFromValue

          this.updateForm.reset()
          this.updateForm.setValue({
            ...this.updateForm.value,
            name: campaign.value.name || '',
            about: campaign.value.about || '',
            description: campaign.value.description || '',
            startDate: campaign.value.startDate.split('T')[0],
            endDate: campaign.value.endDate.split('T')[0],
            oldDocuments: campaign.value.documents || [],
            newDocuments: [],
            isReturningProfitsToInvestors: isReturningProfitsToInvestors,
            returnFrequency: campaign.value.return.frequency || '',
            returnFrom: campaign.value.return.from || 0,
            returnTo: campaign.value.return.to || 0,
            isReturnValueFixed: isReturnValueFixed,
          })

          if (!campaign.value.return.from) {
            this.updateForm.controls.returnFrom.setValue(undefined)
          }

          if (!campaign.value.return.to) {
            this.updateForm.controls.returnTo.setValue(undefined)
          }

          this.newsUrls.clear()
          campaign.value.newsURLs.forEach(url =>
            this.newsUrls.push(this.createNewsUrlControl(url)),
          )

          this.toggleReturnFrequencyControls(isReturningProfitsToInvestors)
          this.toggleReturnToControls(isReturnValueFixed)

          this.newsUrls.markAsPristine()
          this.updateForm.markAsPristine()
        }
      }),
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
      return this.campaignService.uploadInfo(
        {
          name: this.updateForm.value.name,
          photo: this.updateForm.value.logo?.[0],
          about: this.updateForm.value.about,
          description: this.updateForm.value.description,
          startDate: new Date(this.updateForm.value.startDate).toISOString(),
          endDate: new Date(this.updateForm.value.endDate).toISOString(),
          documents: this.updateForm.value.oldDocuments,
          newDocuments: this.updateForm.value.newDocuments,
          return: this.createCampaignReturnObject(),
          newsURLs: this.newsUrls.value,
        },
        campaign,
      ).pipe(
        switchMap(uploadRes => this.campaignService.updateInfo(campaign.contractAddress, uploadRes.path)),
        switchMap(() => this.dialogService.info('Campaign successfully updated!', false)),
        switchMap(() => this.routerService.navigate(['..'], {relativeTo: this.route})),
      )
    }
  }

  private createNewsUrlControl(value: string) {
    return this.fb.control(value, [Validators.required, Validators.pattern('[^\\s]*')])
  }

  private createCampaignReturnObject(): { frequency?: ReturnFrequency, from?: number, to?: number } {
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

  private static validReturnFromTo(formGroup: FormGroup): ValidationErrors | null {
    if (formGroup.value.isReturningProfitsToInvestors) {
      const returnFrom = formGroup.value.returnFrom
      if (returnFrom <= 0 || returnFrom > 1) {
        return {invalidReturnFrom: true}
      }

      if (!formGroup.value.isReturnValueFixed) {
        const returnTo = formGroup.value.returnTo
        if (returnTo <= 0 || returnTo > 1) {
          return {invalidReturnTo: true}
        }

        if (returnFrom >= returnTo) {
          return {invalidReturnFromToRange: true}
        }
      }
    }

    return null
  }

  private static validDateRange(formGroup: FormGroup): ValidationErrors | null {
    if (formGroup.value.startDate > formGroup.value.endDate) {
      return {invalidDateRange: true}
    }

    return null
  }
}
