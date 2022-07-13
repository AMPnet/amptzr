import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  CampaignCommonStateWithName,
  QueryService,
} from '../../shared/services/blockchain/query.service'
import { withStatus } from '../../shared/utils/observables'
import { CampaignVisibility } from './admin-issuer-edit-campaign-visibility-card/admin-issuer-edit-campaign-visibility-card.component'
import { IPFSOffersDisplaySettings } from '../../../../types/ipfs/issuer'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap, tap } from 'rxjs/operators'
import { DialogService } from '../../shared/services/dialog.service'
import { PreferenceStore } from '../../preference/state/preference.store'
import { RouterService } from '../../shared/services/router.service'
import {
  IssuerService,
  IssuerWithInfo,
} from '../../shared/services/blockchain/issuer/issuer.service'
import { CampaignService } from '../../shared/services/blockchain/campaign/campaign.service'

@Component({
  selector: 'app-admin-issuer-edit-campaign-visibility',
  templateUrl: './admin-issuer-edit-campaign-visibility.component.html',
  styleUrls: ['./admin-issuer-edit-campaign-visibility.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIssuerEditCampaignVisibilityComponent {
  issuer$: Observable<IssuerWithInfo>
  visibilityData$ = withStatus(
    combineLatest([
      this.queryService.offers$,
      this.issuerService.offersDisplaySettings$,
    ]).pipe(
      map(([offers, offersDisplaySettings]) => {
        return { offers, offersDisplaySettings }
      })
    )
  )

  hiddenCampaigns: Set<string> = new Set([])
  initialized: boolean = false

  constructor(
    private issuerService: IssuerService,
    private campaignService: CampaignService,
    private queryService: QueryService,
    private routerService: RouterService,
    private preferenceStore: PreferenceStore,
    private dialogService: DialogService
  ) {
    this.issuer$ = this.issuerService.issuer$
  }

  onCampaignVisibilityChange(value: CampaignVisibility) {
    if (value.isHidden) {
      this.hiddenCampaigns.add(value.campaignAddress)
    } else {
      this.hiddenCampaigns.delete(value.campaignAddress)
    }
  }

  isCampaignHidden(
    offer: CampaignCommonStateWithName,
    displaySettings: IPFSOffersDisplaySettings
  ) {
    return displaySettings.hiddenOffers.includes(offer.campaign.contractAddress)
  }

  updateCampaignVisibility(issuer: IssuerWithInfo) {
    return () => {
      return this.issuerService
        .uploadOffersDisplaySettings(
          { hiddenOffers: Array.from(this.hiddenCampaigns) },
          issuer.infoData
        )
        .pipe(
          switchMap((result) =>
            this.issuerService.updateInfo(issuer.contractAddress, result.path)
          ),
          switchMap(() =>
            this.dialogService.success({
              message: "Campaign's visibility has been updated.",
            })
          ),
          tap(() => this.refreshIssuer()),
          tap(() => this.routerService.navigate(['/admin']))
        )
    }
  }

  hasUnsavedChanges(offersDisplaySettings: IPFSOffersDisplaySettings) {
    const currentlyHiddenCampaigns = new Set(offersDisplaySettings.hiddenOffers)
    const sameSetSizes =
      this.hiddenCampaigns.size === currentlyHiddenCampaigns.size

    if (!this.initialized) {
      if (sameSetSizes) {
        this.initialized = true
      }
      return false
    }

    const equalSets =
      sameSetSizes &&
      [...this.hiddenCampaigns].every((value) =>
        currentlyHiddenCampaigns.has(value)
      )
    return !equalSets
  }

  private refreshIssuer() {
    this.preferenceStore.update({
      issuer: {
        ...this.preferenceStore.getValue().issuer,
      },
    })
  }
}
