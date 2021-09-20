import {Injectable} from '@angular/core'
import {QueryService} from './query.service'
import {Observable, of} from 'rxjs'
import {map} from 'rxjs/operators'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {AssetFlavor, IssuerFlavor} from './flavors'

@Injectable({
  providedIn: 'root',
})
export class NameService {
  // contract$ = combineLatest([
  //   this.queryService.contract$,
  //   this.preferenceQuery.network$.pipe(
  //     map(network => network.tokenizerConfig.nameRegistry),
  //   ),
  // ])

  constructor(private queryService: QueryService,
              private preferenceQuery: PreferenceQuery) {
  }

  getIssuers(ids: string[]): Observable<IssuerCommonStateWithName[]> {
    // return this.contract$.pipe(
    //   switchMap(([contract, nameRegistry]) =>
    //     this.isAddress(ids[0]) ?
    //       contract.getIssuersByAddress(ids, nameRegistry) :
    //       contract.getIssuersByAddress(ids, nameRegistry)
    //   ),
    // )
    return of([{
      contractAddress: ids[0],
      flavor: IssuerFlavor.ISSUER,
      version: '1.0.3',
      name: 'issuer-name',
    }])
  }

  getIssuer(id: string): Observable<IssuerCommonStateWithName> {
    return this.getIssuers([id]).pipe(map(res => res[0]))
  }

  getAssets(ids: string[]) {
    // return this.contract$.pipe(
    //   switchMap(([contract, nameRegistry]) =>
    //     this.isAddress(ids[0]) ?
    //       contract.getAssetsByAddress(ids, nameRegistry) :
    //       contract.getAssetsByAddress(ids, nameRegistry)
    //   ),
    // )
    return of([{
      contractAddress: ids[0],
      flavor: AssetFlavor.ASSET,
      version: '1.0.3',
      name: 'asset-name',
    }])
  }

  getCampaigns(ids: string[]) {

  }

  private isAddress(value: string): boolean {
    return value.startsWith('0x')
  }
}

interface IssuerCommonStateWithName {
  version: string,
  flavor: IssuerFlavor,
  contractAddress: string,
  name: string
}
