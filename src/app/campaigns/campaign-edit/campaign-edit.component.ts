import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms'
import {ActivatedRoute} from '@angular/router'
import {SessionQuery} from '../../session/state/session.query'
import {IpfsService} from '../../shared/services/ipfs/ipfs.service'
import {SignerService} from '../../shared/services/signer.service'
import {DialogService} from '../../shared/services/dialog.service'
import {switchMap, tap} from 'rxjs/operators'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'
import {quillMods} from '../../shared/utils/quill'

@Component({
  selector: 'app-campaign-edit',
  templateUrl: './campaign-edit.component.html',
  styleUrls: ['./campaign-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignEditComponent {
  campaignAddress = this.route.snapshot.params.id

  campaignRefreshSub = new BehaviorSubject<{ isLazy: boolean }>({isLazy: false})
  campaign$: Observable<WithStatus<CampaignWithInfo>>

  updateForm: FormGroup
  newsUrls: FormArray

  quillMods = quillMods

  constructor(private route: ActivatedRoute,
              private campaignService: CampaignService,
              private sessionQuery: SessionQuery,
              private ipfsService: IpfsService,
              private signerService: SignerService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      photo: [undefined],
      about: [''],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      documents: [undefined],
      newDocuments: [undefined],
      newsUrls: this.fb.array([]),
    })
    this.newsUrls = this.updateForm.get('newsUrls') as FormArray

    this.campaign$ = this.campaignRefreshSub.asObservable().pipe(
      switchMap(refresh =>
        withStatus(
          this.campaignService.getCampaignWithInfo(this.campaignAddress, true),
          {hideLoading: refresh.isLazy},
        ),
      ),
      tap(asset => {
        if (asset.value) {
          this.updateForm.reset()
          this.updateForm.setValue({
            ...this.updateForm.value,
            name: asset.value.name || '',
            about: asset.value.about || '',
            description: asset.value.description || '',
            startDate: asset.value.startDate.split('T')[0],
            endDate: asset.value.endDate.split('T')[0],
            documents: asset.value.documents,
            newDocuments: [],
          })
          this.newsUrls.clear()
          asset.value.newsURLs.forEach(url =>
            this.newsUrls.push(this.fb.control(url, [Validators.required])),
          )
        }
      }),
    )
  }

  update(campaign: CampaignWithInfo) {
    return () => {
      return this.campaignService.uploadInfo(
        {
          name: this.updateForm.value.name,
          photo: this.updateForm.value.photo?.[0],
          about: this.updateForm.value.about,
          description: this.updateForm.value.description,
          startDate: new Date(this.updateForm.value.startDate).toISOString(),
          endDate: new Date(this.updateForm.value.endDate).toISOString(),
          documents: this.updateForm.value.documents,
          newDocuments: this.updateForm.value.newDocuments,
          return: {
            from: this.updateForm.value.returnFrom,
            to: this.updateForm.value.returnTo,
          },
          newsURLs: this.newsUrls.value,
        },
        campaign,
      ).pipe(
        switchMap(uploadRes => this.campaignService.updateInfo(this.campaignAddress, uploadRes.path)),
        tap(() => this.campaignRefreshSub.next({isLazy: true})),
        switchMap(() => this.dialogService.info('Campaign successfully updated!', false)),
        tap(() => this.updateForm.get('description')?.markAsPristine()),
      )
    }
  }

  markDescriptionAsDirty() {
    this.updateForm.get('description')?.markAsDirty()
  }

  removeDocument(index: number) {
    this.updateForm.value.documents.splice(index, 1)
    this.updateForm.markAsDirty()
  }

  newsUrlsControls() {
    return this.newsUrls.controls as FormControl[]
  }

  addNewsUrl() {
    this.newsUrls.push(this.fb.control('', [Validators.required]))
  }

  removeNewsUrl(index: number) {
    this.newsUrls.removeAt(index)
    this.newsUrls.markAsDirty()
  }
}
