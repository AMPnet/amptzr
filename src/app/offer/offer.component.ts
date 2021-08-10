import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {CampaignService, CampaignWithInfo} from '../shared/services/blockchain/campaign.service'
import {ActivatedRoute} from '@angular/router'
import {switchMap, tap} from 'rxjs/operators'
import {WithStatus, withStatus} from '../shared/utils/observables'
import {MetaService} from '../shared/services/meta.service'
import {ToUrlIPFSPipe} from '../shared/pipes/to-url-ipfs.pipe'

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferComponent {
  campaign$: Observable<WithStatus<CampaignWithInfo>>

  constructor(private campaignService: CampaignService,
              private metaService: MetaService,
              private toUrlIPFSPipe: ToUrlIPFSPipe,
              private route: ActivatedRoute) {
    const campaignID = this.route.snapshot.params.id

    this.campaign$ = withStatus(
      this.campaignService.getAddressByName(campaignID).pipe(
        switchMap(address => this.campaignService.getCampaignWithInfo(address)),
        tap(campaign => this.metaService.setMeta({
          title: campaign.name,
          description: campaign.about,
          contentURL: window.location.href,
          imageURL: this.toUrlIPFSPipe.transform(campaign.photo),
        })),
      ),
    )
  }
}
