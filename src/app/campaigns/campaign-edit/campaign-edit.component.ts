import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {ActivatedRoute} from '@angular/router'
import {SessionQuery} from '../../session/state/session.query'
import {IpfsService} from '../../shared/services/ipfs/ipfs.service'
import {SignerService} from '../../shared/services/signer.service'
import {DialogService} from '../../shared/services/dialog.service'
import {switchMap, tap} from 'rxjs/operators'
import {CampaignService, CampaignWithInfo} from '../../shared/services/blockchain/campaign.service'

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
    })

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
          newsURLs: this.updateForm.value.newsURLs,
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
}
