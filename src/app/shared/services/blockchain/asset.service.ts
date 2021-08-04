import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {Asset, Asset__factory, AssetFactory, AssetFactory__factory} from '../../../../../types/ethers-contracts'
import {map, switchMap} from 'rxjs/operators'
import {SessionQuery} from '../../../session/state/session.query'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {BigNumber, Signer} from 'ethers'
import {Provider} from '@ethersproject/providers'
import {IPFSAsset} from '../../../../../types/ipfs/asset'
import {IpfsService} from '../ipfs/ipfs.service'

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  factoryContract$: Observable<AssetFactory> = this.sessionQuery.provider$.pipe(
    map(provider =>
      AssetFactory__factory.connect(this.preferenceQuery.network.tokenizerConfig.assetFactory, provider),
    ),
  )

  constructor(private sessionQuery: SessionQuery,
              private ipfsService: IpfsService,
              private preferenceQuery: PreferenceQuery) {
  }

  getAssets(issuer: string): Observable<AssetWithInfo[]> {
    return this.factoryContract$.pipe(
      switchMap(contract => from(contract.getInstancesForIssuer(issuer)).pipe(
        switchMap(assets => assets.length === 0 ? of([]) : combineLatest(
          assets.map(asset => this.getAssetWithInfo(asset))),
        ))),
    )
  }

  contract(address: string, signerOrProvider: Signer | Provider): Asset {
    return Asset__factory.connect(address, signerOrProvider)
  }

  getState(address: string, signerOrProvider: Signer | Provider): Observable<AssetState> {
    return of(this.contract(address, signerOrProvider)).pipe(
      switchMap(contract => contract.getState()),
    )
  }

  getAssetWithInfo(address: string): Observable<AssetWithInfo> {
    return this.sessionQuery.provider$.pipe(
      switchMap(provider => this.getState(address, provider)),
      switchMap(state => this.ipfsService.get<IPFSAsset>(state.info).pipe(
        map(info => ({...state, ...info})),
      )),
    )
  }
}

export interface AssetState {
  contractAddress: string;
  id: BigNumber;
  owner: string;
  mirroredToken: string;
  initialTokenSupply: BigNumber;
  whitelistRequiredForTransfer: boolean;
  assetApprovedByIssuer: boolean;
  issuer: string;
  info: string;
  name: string;
  symbol: string;
}

export type AssetWithInfo = AssetState & IPFSAsset
