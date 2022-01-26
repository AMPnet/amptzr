import {Injectable} from '@angular/core'
import {
  AssetCommonStateWithName,
  CampaignCommonStateWithName,
  IssuerCommonStateWithName,
  QueryService,
} from './query.service'
import {from, Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {extract} from '../../utils/ethersjs'

@Injectable({
  providedIn: 'root',
})
export class NameService {
  constructor(private queryService: QueryService) {
  }

  getIssuer(id: string): Observable<IssuerCommonStateWithName> {
    return from(
      this.isAddress(id) ?
        this.queryService.getIssuerForAddress(id) :
        this.queryService.getIssuerForName(id),
    ).pipe(
      map(res => ({
        issuer: extract(res.issuer),
        mappedName: res.mappedName,
      })),
    )
  }

  getAsset(id: string): Observable<AssetCommonStateWithName> {
    return from(
      this.isAddress(id) ?
        this.queryService.getAssetForAddress(id) :
        this.queryService.getAssetForName(id),
    ).pipe(
      map(res => ({
        asset: extract(res.asset),
        mappedName: res.mappedName,
      })),
    )
  }

  getCampaign(id: string): Observable<CampaignCommonStateWithName> {
    return from(this.isAddress(id) ?
      this.queryService.getCampaignForAddress(id) :
      this.queryService.getCampaignForName(id),
    ).pipe(
      map(res => ({
        campaign: extract(res.campaign),
        mappedName: res.mappedName,
      })),
    )
  }

  getAssetsForIssuer(id: string): Observable<AssetCommonStateWithName[]> {
    return from(
      this.isAddress(id) ?
        this.queryService.getAssetsForIssuerAddress(id) :
        this.queryService.getAssetsForIssuerName(id),
    ).pipe(
      map(res => res.map(item => ({
        asset: extract(item.asset),
        mappedName: item.mappedName,
      }))),
    )
  }

  getCampaignsForIssuer(id: string) {
    return from(
      this.isAddress(id) ?
        this.queryService.getCampaignsForIssuerAddress(id) :
        this.queryService.getCampaignsForIssuerName(id),
    ).pipe(
      map(res => res.map(item => ({
        campaign: extract(item.campaign),
        mappedName: item.mappedName,
      }))),
    )
  }

  getCampaignsForAsset(id: string) {
    return from(
      this.isAddress(id) ?
        this.queryService.getCampaignsForAssetAddress(id) :
        this.queryService.getCampaignsForAssetName(id),
    ).pipe(
      map(res => res.map(item => ({
        campaign: extract(item.campaign),
        mappedName: item.mappedName,
      }))),
    )
  }

  private isAddress(value: string): boolean {
    return value.startsWith('0x')
  }
}
