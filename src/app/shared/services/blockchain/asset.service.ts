import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {Asset, Asset__factory, AssetFactory, AssetFactory__factory} from '../../../../../types/ethers-contracts'
import {first, map, switchMap} from 'rxjs/operators'
import {SessionQuery} from '../../../session/state/session.query'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {BigNumber, BigNumberish, Signer} from 'ethers'
import {Provider} from '@ethersproject/providers'
import {IPFSAsset} from '../../../../../types/ipfs/asset'
import {IpfsService, IPFSText} from '../ipfs/ipfs.service'
import {SignerService} from '../signer.service'
import {findLog} from '../../utils/ethersjs'
import {IPFSAddResult} from '../ipfs/ipfs.service.types'
import {DialogService} from '../dialog.service'
import {StablecoinService} from './stablecoin.service'

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
              private signerService: SignerService,
              private dialogService: DialogService,
              private stablecoin: StablecoinService,
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

  getAssetWithInfo(address: string, fullInfo = false): Observable<AssetWithInfo> {
    return this.sessionQuery.provider$.pipe(
      switchMap(provider => this.getState(address, provider)),
      switchMap(state => this.ipfsService.get<IPFSAsset>(state.info).pipe(
        map(info => ({...state, ...info})),
      )),
      switchMap(asset => fullInfo ? combineLatest([
        this.ipfsService.get<IPFSText>(asset.description),
      ]).pipe(
        map(([descriptionRes]) => ({
          ...asset,
          description: descriptionRes.content,
        })),
      ) : of(asset)),
    )
  }

  uploadInfo(logo: File, description: string, asset?: IPFSAsset): Observable<IPFSAddResult> {
    return combineLatest([
      logo ? this.ipfsService.addFile(logo) : of(undefined),
      this.ipfsService.addText(description),
    ]).pipe(
      switchMap(([logoIPFS, descriptionIPFS]) => this.ipfsService.addObject<IPFSAsset>({
        version: 0.1,
        logo: logoIPFS?.path || asset?.logo || '',
        description: descriptionIPFS.path || asset?.description || '',
        documents: [], // TODO: implement documents upload
      })),
    )
  }

  updateInfo(assetAddress: string, infoHash: string) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(assetAddress, signer)),
      switchMap(contract => contract.setInfo(infoHash)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
    )
  }

  create(data: CreateAssetData): Observable<string | undefined> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.factoryContract$,
    ]).pipe(
      first(),
      map(([signer, contract]) => contract.connect(signer)),
      switchMap(contract => {
        const creator = this.sessionQuery.getValue().address!

        return from(contract.functions.create(
          creator, data.issuer, data.ansName,
          data.initialTokenSupply, data.whitelistRequiredForTransfer,
          data.name, data.symbol, data.info,
        )).pipe(
          switchMap(tx => this.dialogService.loading(
            from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
            'Processing transaction...',
          )),
          map(receipt => findLog(
            receipt, contract, contract.interface.getEvent('AssetCreated'),
          )?.args?.asset),
        )
      }),
    )
  }

  transferTokensToCampaign(assetAddress: string, campaignAddress: string, amount: number) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(assetAddress, signer)),
      switchMap(contract => contract.transfer(campaignAddress, this.stablecoin.parse(amount, 18))),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
    )
  }

  balance(assetAddress: string): Observable<BigNumber> {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(assetAddress, signer)),
      switchMap(contract => from(contract.signer.getAddress()).pipe(
        switchMap(signerAddress => contract.balanceOf(signerAddress)),
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

interface CreateAssetData {
  issuer: string,
  ansName: string,
  initialTokenSupply: BigNumberish,
  whitelistRequiredForTransfer: boolean,
  name: string,
  symbol: string,
  info: string,
}
