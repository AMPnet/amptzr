import {Injectable} from '@angular/core'
import {QueryService__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {filter, map, switchMap} from 'rxjs/operators'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {combineLatest, Observable} from 'rxjs'
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
    this.preferenceQuery.network$,
  ]).pipe(
    switchMap(([contract, network]) =>
      contract.getIssuers(
        Object.values(network.tokenizerConfig.issuerFactory).filter(i => i),
        network.tokenizerConfig.nameRegistry,
      )),
  )

  offers$: Observable<OfferItem[]> = combineLatest([
    this.contract$,
    this.preferenceQuery.issuer$,
    this.preferenceQuery.network$,
  ]).pipe(
    switchMap(([contract, issuer, network]) =>
      contract.getCampaignsForIssuer(issuer.address,
        Object.values(network.tokenizerConfig.cfManagerFactory).filter(i => i),
        network.tokenizerConfig.nameRegistry,
      )),
  )

  portfolio$: Observable<PortfolioItem[]> = combineLatest([
    this.contract$,
    this.preferenceQuery.issuer$,
    this.preferenceQuery.network$,
    this.sessionQuery.address$,
  ]).pipe(
    filter(([_contract, _issuer, _network, address]) => !!address),
    switchMap(([contract, issuer, network, address]) =>
      contract.getCampaignsForIssuerInvestor(
        issuer.address, address!,
        Object.values(network.tokenizerConfig.cfManagerFactory).filter(i => i),
        network.tokenizerConfig.nameRegistry,
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
        Object.values(this.preferenceQuery.network.tokenizerConfig.assetFactory).filter(i => i),
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getAssetsForIssuerName(slug: string): Observable<AssetCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getAssetsForIssuerName(slug,
        Object.values(this.preferenceQuery.network.tokenizerConfig.assetFactory).filter(i => i),
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getCampaignsForIssuerAddress(address: string): Observable<CampaignCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getCampaignsForIssuer(address,
        Object.values(this.preferenceQuery.network.tokenizerConfig.cfManagerFactory).filter(i => i),
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getCampaignsForIssuerName(slug: string): Observable<CampaignCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getCampaignsForIssuerName(slug,
        Object.values(this.preferenceQuery.network.tokenizerConfig.cfManagerFactory).filter(i => i),
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getCampaignsForAssetAddress(address: string): Observable<CampaignCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getCampaignsForAsset(address,
        Object.values(this.preferenceQuery.network.tokenizerConfig.cfManagerFactory).filter(i => i),
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
  }

  getCampaignsForAssetName(slug: string): Observable<CampaignCommonStateWithName[]> {
    return this.contract$.pipe(
      switchMap(contract => contract.getCampaignsForAssetName(slug,
        Object.values(this.preferenceQuery.network.tokenizerConfig.cfManagerFactory).filter(i => i),
        this.preferenceQuery.network.tokenizerConfig.nameRegistry),
      ),
    )
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
