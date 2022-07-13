import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators'
import { WithStatus, withStatus } from '../shared/utils/observables'
import { MetaService } from '../shared/services/meta.service'
import { ToUrlIPFSPipe } from '../shared/pipes/to-url-ipfs.pipe'
import { IdentityService } from '../identity/identity.service'
import { ProfileService } from '../profile/profile.service'
import { RouterService } from '../shared/services/router.service'
import { DialogService } from '../shared/services/dialog.service'
import {
  LinkPreviewResponse,
  LinkPreviewService,
} from '../shared/services/backend/link-preview.service'
import { quillMods } from '../shared/utils/quill'
import { TailwindService } from '../shared/services/tailwind.service'
import { NameService } from '../shared/services/blockchain/name.service'
import {
  CampaignService,
  CampaignStats,
  CampaignWithInfo,
} from '../shared/services/blockchain/campaign/campaign.service'
import { CampaignFlavor } from '../shared/services/blockchain/flavors'
import { PreferenceQuery } from '../preference/state/preference.query'

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferComponent {
  campaignSub = new BehaviorSubject<void>(undefined)
  campaignData$: Observable<
    WithStatus<{
      campaign: CampaignWithInfo
      stats: CampaignStats
    }>
  >
  links$: Observable<WithStatus<{ value: LinkPreviewResponse[] }>>
  address$ = this.preferenceQuery.address$.pipe(
    map((value) => ({ value: value }))
  )

  isMobileScreenSize$: Observable<boolean>

  quillMods = quillMods

  constructor(
    private campaignService: CampaignService,
    private nameService: NameService,
    private metaService: MetaService,
    private toUrlIPFSPipe: ToUrlIPFSPipe,
    private identityService: IdentityService,
    private profileService: ProfileService,
    private preferenceQuery: PreferenceQuery,
    private dialogService: DialogService,
    private router: RouterService,
    private route: ActivatedRoute,
    private tailwindService: TailwindService,
    private linkPreviewService: LinkPreviewService
  ) {
    const campaignId = this.route.snapshot.params.id

    this.campaignData$ = this.campaignSub.asObservable().pipe(
      switchMap(() =>
        withStatus(
          this.nameService.getCampaign(campaignId).pipe(
            switchMap((campaign) =>
              combineLatest([
                this.campaignService.getCampaignInfo(campaign.campaign),
                this.campaignService.stats(
                  campaign.campaign.contractAddress,
                  campaign.campaign.flavor as CampaignFlavor
                ),
              ])
            ),
            tap(([campaign, stats]) =>
              this.metaService.setMeta({
                title: campaign.infoData.name,
                description: campaign.infoData.about,
                contentURL: window.location.href,
                imageURL: this.toUrlIPFSPipe.transform(campaign.infoData.photo),
              })
            ),
            map(([campaign, stats]) => {
              return { campaign, stats }
            })
          )
        )
      )
    )

    this.links$ = this.campaignData$.pipe(
      filter((campaignData) => !!campaignData.value),
      switchMap((campaignData) => {
        if (!campaignData.value!.campaign.infoData.newsURLs) {
          return withStatus(of({ value: [] }))
        }

        const previewLinks =
          campaignData.value!.campaign.infoData!.newsURLs?.map((url) =>
            this.linkPreviewService.previewLink(url)
          )

        return withStatus(
          combineLatest(previewLinks).pipe(map((value) => ({ value })))
        )
      })
    )

    this.isMobileScreenSize$ = this.tailwindService.screenResize$.pipe(
      startWith(this.tailwindService.getScreen()),
      map((screen) => screen === ('sm' || 'md'))
    )
  }

  goToInvest(campaign: CampaignWithInfo) {
    return () => {
      return this.identityService.ensureIdentityChecked(campaign).pipe(
        // TODO: add check for balance > 0
        switchMap(() => this.profileService.ensureBasicInfo),
        switchMap(() =>
          this.router.navigate(['invest'], { relativeTo: this.route })
        )
      )
    }
  }

  finalize(campaign: CampaignWithInfo) {
    return () => {
      return this.campaignService
        .finalize(campaign.contractAddress, campaign.flavor as CampaignFlavor)
        .pipe(
          switchMap(() =>
            this.dialogService.success({
              message: 'The project has been finalized.',
            })
          ),
          tap(() => this.campaignSub.next())
        )
    }
  }

  isFinalizableFlavor(flavor: string): boolean {
    return [CampaignFlavor.BASIC, CampaignFlavor.VESTING].includes(
      flavor as CampaignFlavor
    )
  }
}
