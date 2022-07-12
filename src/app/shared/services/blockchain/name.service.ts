import { Injectable } from '@angular/core'
import {
  AssetCommonStateWithName,
  CampaignCommonStateWithName,
  IssuerCommonStateWithName,
  QueryService,
} from './query.service'
import { from, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class NameService {
  constructor(private queryService: QueryService) {}

  getIssuer(id: string): Observable<IssuerCommonStateWithName> {
    return from(
      this.isAddress(id)
        ? this.queryService.getIssuerForAddress(id)
        : this.queryService.getIssuerForName(id)
    )
  }

  getAsset(id: string): Observable<AssetCommonStateWithName> {
    return from(
      this.isAddress(id)
        ? this.queryService.getAssetForAddress(id)
        : this.queryService.getAssetForName(id)
    )
  }

  getCampaign(id: string): Observable<CampaignCommonStateWithName> {
    return from(
      this.isAddress(id)
        ? this.queryService.getCampaignForAddress(id)
        : this.queryService.getCampaignForName(id)
    )
  }

  getAssetsForIssuer(id: string): Observable<AssetCommonStateWithName[]> {
    return from(
      this.isAddress(id)
        ? this.queryService.getAssetsForIssuerAddress(id)
        : this.queryService.getAssetsForIssuerName(id)
    )
  }

  getCampaignsForIssuer(id: string) {
    return from(
      this.isAddress(id)
        ? this.queryService.getCampaignsForIssuerAddress(id)
        : this.queryService.getCampaignsForIssuerName(id)
    )
  }

  getCampaignsForAsset(id: string) {
    return from(
      this.isAddress(id)
        ? this.queryService.getCampaignsForAssetAddress(id)
        : this.queryService.getCampaignsForAssetName(id)
    )
  }

  private isAddress(value: string): boolean {
    return value.startsWith('0x')
  }
}
