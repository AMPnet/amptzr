import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs'
import {CampaignService, CampaignWithInfo} from '../shared/services/blockchain/campaign.service'
import {ActivatedRoute} from '@angular/router'
import {filter, map, startWith, switchMap, tap} from 'rxjs/operators'
import {WithStatus, withStatus} from '../shared/utils/observables'
import {MetaService} from '../shared/services/meta.service'
import {ToUrlIPFSPipe} from '../shared/pipes/to-url-ipfs.pipe'
import {IdentityService} from '../identity/identity.service'
import {ProfileService} from '../profile/profile.service'
import {RouterService} from '../shared/services/router.service'
import {DialogService} from '../shared/services/dialog.service'
import {SessionQuery} from '../session/state/session.query'
import {LinkPreviewResponse, LinkPreviewService} from '../shared/services/backend/link-preview.service'
import {quillMods} from '../shared/utils/quill'
import {TailwindService} from '../shared/services/tailwind.service'
import {resolveAddress} from '../shared/utils/ethersjs'

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferComponent {
  campaignSub = new BehaviorSubject<void>(undefined)
  campaign$: Observable<WithStatus<CampaignWithInfo>>
  links$: Observable<WithStatus<{ value: LinkPreviewResponse[] }>>
  address$ = this.sessionQuery.address$.pipe(
    map(value => ({value: value})),
  )

  isMobileScreenSize$: Observable<boolean>

  quillMods = quillMods

  constructor(private campaignService: CampaignService,
              private metaService: MetaService,
              private toUrlIPFSPipe: ToUrlIPFSPipe,
              private identityService: IdentityService,
              private profileService: ProfileService,
              private sessionQuery: SessionQuery,
              private dialogService: DialogService,
              private router: RouterService,
              private route: ActivatedRoute,
              private tailwindService: TailwindService,
              private linkPreviewService: LinkPreviewService) {
    const campaignId = this.route.snapshot.params.id

    this.campaign$ = this.campaignSub.asObservable().pipe(
      switchMap(() => withStatus(
        resolveAddress(campaignId, this.campaignService.getAddressByName(campaignId)).pipe(
          switchMap(address => this.campaignService.getCampaignWithInfo(address)),
          tap(campaign => this.metaService.setMeta({
            title: campaign.name,
            description: campaign.about,
            contentURL: window.location.href,
            imageURL: this.toUrlIPFSPipe.transform(campaign.photo),
          })),
        ),
      )),
    )

    this.links$ = this.campaign$.pipe(
      filter((campaign) => !!campaign.value),
      switchMap((campaign) => {
        if (!campaign.value!.newsURLs) {
          return withStatus(of({value: []}))
        }

        const previewLinks = campaign.value!.newsURLs?.map((url) => this.linkPreviewService.previewLink(url))

        return withStatus(combineLatest(previewLinks).pipe(map(value => ({value}))))
      }),
    )

    this.isMobileScreenSize$ = this.tailwindService.screenResize$.pipe(
      startWith(this.tailwindService.getScreen()),
      map(screen => screen === ('sm' || 'md')),
    )
  }

  goToInvest(campaignAddress: string) {
    return () => {
      return this.identityService.ensureIdentityChecked(campaignAddress).pipe(
        // TODO: add check for balance > 0
        switchMap(() => this.profileService.ensureBasicInfo),
        switchMap(() => this.router.navigate(['invest'], {relativeTo: this.route})),
      )
    }
  }

  finalize(campaignAddress: string) {
    return () => {
      return this.campaignService.finalize(campaignAddress).pipe(
        switchMap(() => this.dialogService.success('The project has been finalized successfully.')),
        tap(() => this.campaignSub.next()),
      )
    }
  }
}
