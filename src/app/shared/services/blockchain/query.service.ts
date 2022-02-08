import {Injectable} from '@angular/core'
import {QueryService__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {filter, map, switchMap} from 'rxjs/operators'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {combineLatest, Observable, of} from 'rxjs'
import {BigNumber} from 'ethers'
import {CampaignCommonState} from './campaign/campaign.common'
import {IssuerCommonState} from './issuer/issuer.common'
import {AssetCommonState} from './asset/asset.common'

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  contract$ = combineLatest([
    this.preferenceQuery.network$,
    this.sessionQuery.provider$,
  ]).pipe(
    map(([network, provider]) =>
      QueryService__factory.connect(network.tokenizerConfig.queryService, provider)),
  )

  issuers$: Observable<IssuerCommonStateWithName[]> = combineLatest([
    this.contract$,
  ]).pipe(
    switchMap(([contract]) =>
      contract.getIssuers(
        this.preferenceQuery.issuerFactories,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry,
      )),
  )

  offers$: Observable<OfferItem[]> = combineLatest([
    this.contract$,
    this.preferenceQuery.issuer$,
  ]).pipe(
    switchMap(([contract, issuer]) =>
      contract.getCampaignsForIssuer(issuer.address,
        this.preferenceQuery.campaignFactories,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry,
      )),
  )

  portfolio$: Observable<PortfolioItem[]> = combineLatest([
    this.contract$,
    this.preferenceQuery.issuer$,
    this.preferenceQuery.address$,
  ]).pipe(
    filter(([_contract, _issuer, address]) => !!address),
    switchMap(([contract, issuer, address]) =>
      contract.getCampaignsForIssuerInvestor(
        issuer.address, address!,
        this.preferenceQuery.campaignFactories,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry,
      ) as Promise<PortfolioItem[]>),
    map(portfolio => portfolio.filter(item => item.tokenAmount > BigNumber.from(0))),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery) {
  }

  getIssuerForAddress(address: string): Observable<IssuerCommonStateWithName> {
    return this.contract$.pipe(
      switchMap(contract => contract.getIssuer(address,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getIssuerForName(slug: string): Observable<IssuerCommonStateWithName> {
    return this.contract$.pipe(
      switchMap(contract => contract.getIssuerForName(slug,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getAssetForAddress(address: string): Observable<AssetCommonStateWithName> {
    return this.contract$.pipe(
      switchMap(contract => contract.getAsset(address,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getAssetForName(slug: string): Observable<AssetCommonStateWithName> {
    return this.contract$.pipe(
      switchMap(contract => contract.getAssetForName(slug,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getCampaignForAddress(address: string): Observable<CampaignCommonStateWithName> {
    return this.contract$.pipe(
      switchMap(contract => contract.getCampaign(address,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getCampaignForName(slug: string): Observable<CampaignCommonStateWithName> {
    return this.contract$.pipe(
      switchMap(contract => contract.getCampaignForName(slug,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getAssetsForIssuerAddress(address: string): Observable<AssetCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getAssetsForIssuer(address,
        this.preferenceQuery.assetFactories,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getAssetsForIssuerName(slug: string): Observable<AssetCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getAssetsForIssuerName(slug,
        this.preferenceQuery.assetFactories,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getCampaignsForIssuerAddress(address: string): Observable<CampaignCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getCampaignsForIssuer(address,
        this.preferenceQuery.campaignFactories,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getCampaignsForIssuerName(slug: string): Observable<CampaignCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getCampaignsForIssuerName(slug,
        this.preferenceQuery.campaignFactories,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getCampaignsForAssetAddress(address: string): Observable<CampaignCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getCampaignsForAsset(address,
        this.preferenceQuery.campaignFactories,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getCampaignsForAssetName(slug: string): Observable<CampaignCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getCampaignsForAssetName(slug,
        this.preferenceQuery.campaignFactories,
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getAssetsBalancesForOwnerAddress(address: string): Observable<AssetWithBalance[]> {
    // return this.contract$.pipe(
    //   switchMap(contract => contract.getAssetsForIssuer(address,
    //     this.preferenceQuery.assetFactories,
    //     this.preferenceQuery.network.tokenizerConfig.nameRegistry),
    //   ),
    // )
    return of([
      {
        contractAddress: '0xfDBdcDc78b993afA6798fB3169Ee03585CedbE29',
        name: 'Wednesday',
        symbol: 'WED',
        decimals: 6,
        balance: BigNumber.from('23000000'),
      },
      {
        contractAddress: '0xfDBdcDc78b993afA6798fB3169Ee03585CedbE29',
        name: 'Lolz',
        symbol: 'LOL',
        decimals: 9,
        balance: BigNumber.from('144500000000'),
      },
    ])
  }
}

interface OfferItem {
  campaign: CampaignCommonState;
  mappedName: string;
}

interface PortfolioInvested {
  mappedName: string;
  tokenAmount: BigNumber;
  tokenValue: BigNumber;
}

export interface PortfolioItem extends PortfolioInvested {
  campaign: CampaignCommonState;
}

export interface IssuerCommonStateWithName {
  issuer: IssuerCommonState
  mappedName: string
}

export interface AssetCommonStateWithName {
  asset: AssetCommonState
  mappedName: string
}

export interface CampaignCommonStateWithName {
  campaign: CampaignCommonState
  mappedName: string
}

export interface AssetWithBalance {
  contractAddress: string
  decimals: number
  symbol: string
  name: string
  balance: BigNumber
  asset?: AssetCommonState
}
