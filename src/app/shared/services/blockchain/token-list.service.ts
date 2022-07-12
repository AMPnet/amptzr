import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { combineLatest, forkJoin, Observable, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'
import { ChainID } from '../../networks'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { QueryService } from './query.service'
import { AssetService } from './asset/asset.service'
import { ToUrlIPFSPipe } from '../../pipes/to-url-ipfs.pipe'

@Injectable({
  providedIn: 'root',
})
export class TokenListService {
  // TODO: change query service method when available for all assets
  assetList$: Observable<Token[]> = this.queryService
    .getERC20AssetsForIssuer(this.preferenceQuery.getValue().address)
    .pipe(
      switchMap((res) =>
        res.length > 0
          ? forkJoin(
              res.map((item) =>
                of(item.commonState).pipe(
                  switchMap((commonState) =>
                    commonState?.info
                      ? this.assetService.getAssetInfo(commonState)
                      : of(undefined)
                  ),
                  map(
                    (asset) =>
                      ({
                        chainId: this.preferenceQuery.getValue().chainID,
                        address: item.contractAddress,
                        symbol: item.symbol,
                        name: item.name,
                        decimals: item.decimals,
                        logoURI: asset?.infoData?.logo
                          ? this.toUrlIPFSPipe.transform(asset.infoData.logo)
                          : undefined,
                        tags: [],
                      } as Token)
                  ),
                  catchError(() => of(undefined))
                )
              )
            ).pipe(
              map(
                (tokens) =>
                  tokens.filter((token) => token !== undefined) as Token[]
              )
            )
          : of([])
      ),
      catchError(() => of([]))
    )

  constructor(
    private http: HttpClient,
    private preferenceQuery: PreferenceQuery,
    private queryService: QueryService,
    private toUrlIPFSPipe: ToUrlIPFSPipe,
    private assetService: AssetService
  ) {}

  fetchListsWithAssets(lists: string[]): Observable<Token[]> {
    return combineLatest([this.fetchLists(lists), this.assetList$]).pipe(
      map((lists) => lists.flat() as Token[])
    )
  }

  fetchLists(lists: string[]): Observable<Token[]> {
    return forkJoin(lists.map((list) => this.fetchList(list))).pipe(
      map((lists) => lists.flat() as Token[])
    )
  }

  fetchList(url: string, chainID?: ChainID): Observable<Token[]> {
    return this.http.get<TokenList>(url).pipe(
      map((res) => res.tokens),
      map((tokens) =>
        chainID ? tokens.filter((token) => token.chainId === chainID) : tokens
      ),
      catchError(() => of([]))
    )
  }
}

export interface TokenList {
  name: string
  logoURI: string
  keywords: string[]
  tags: {
    [key: string]: Tag
  }
  timestamp: Date
  tokens: Token[]
  version: Version
}

interface Tag {
  name: string
  description: string
}

export interface Token {
  chainId: number
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  tags: string[]
}

export interface Version {
  major: number
  minor: number
  patch: number
}
