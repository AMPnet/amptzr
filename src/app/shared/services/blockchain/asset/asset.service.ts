import {IpfsService, IPFSText} from '../../ipfs/ipfs.service'
import {PreferenceQuery} from '../../../../preference/state/preference.query'
import {StablecoinService} from '../stablecoin.service'
import {GasService} from '../gas.service'
import {BigNumber, BigNumberish, Signer} from 'ethers'
import {combineLatest, from, Observable, of} from 'rxjs'
import {map, switchMap} from 'rxjs/operators'
import {IPFSAsset} from '../../../../../../types/ipfs/asset'
import {Injectable} from '@angular/core'
import {DialogService} from '../../dialog.service'
import {SignerService} from '../../signer.service'
import {SessionQuery} from '../../../../session/state/session.query'
import {IPFSAddResult} from '../../ipfs/ipfs.service.types'
import {AssetBasicService, AssetState} from './asset-basic.service'
import {Provider} from '@ethersproject/providers'
import {AssetTransferableService, TransferableAssetState} from './asset-transferable.service'
import {AssetFlavor} from '../flavors'

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  constructor(
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private assetBasicService: AssetBasicService,
    private assetTransferableService: AssetTransferableService,
    private ipfsService: IpfsService,
    private signerService: SignerService,
    private dialogService: DialogService,
    private stablecoin: StablecoinService,
    private gasService: GasService,
  ) {
  }

  // TODO: remove this and use query service
  getAssets(issuer: string): Observable<AssetWithInfo[]> {
    return this.assetBasicService.factoryContract$.pipe(
      switchMap(contract => from(contract.getInstancesForIssuer(issuer)).pipe(
        switchMap(assets => assets.length === 0 ? of([]) : combineLatest(
          assets.map(asset => this.getAssetWithInfo(asset))),
        ))),
    )
  }

  // TODO: remove this and use query service
  getAddressByName(ansName: string): Observable<string> {
    return this.assetBasicService.factoryContract$.pipe(
      switchMap(contract => contract.namespace(this.preferenceQuery.issuer.address, ansName)),
    )
  }

  getCommonState(address: string, signerOrProvider: Signer | Provider): Observable<AssetState> {
    return of(this.assetBasicService.contract(address, signerOrProvider)).pipe(
      switchMap(contract => contract.getState()), // TODO: set to getBasicState
    )
  }

  getState(
    address: string, flavor: AssetFlavor, signerOrProvider: Signer | Provider,
  ): Observable<AssetState | TransferableAssetState> {
    return of(address).pipe(
      switchMap(address => {
        switch (flavor) {
          case AssetFlavor.TRANSFERABLE:
            return this.assetTransferableService.getState(address, signerOrProvider)
          case AssetFlavor.ASSET:
          default:
            return this.assetBasicService.getState(address, signerOrProvider)
        }
      }),
    )
  }

  getAssetWithInfo(address: string, fullInfo = false): Observable<AssetWithInfo> {
    return this.sessionQuery.provider$.pipe(
      switchMap(provider => this.getCommonState(address, provider)),
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

  uploadInfo(logo: File, description?: string, asset?: IPFSAsset): Observable<IPFSAddResult> {
    return combineLatest([
      logo ? this.ipfsService.addFile(logo) : of(undefined),
      description ? this.ipfsService.addText(description) : of({} as Partial<IPFSAddResult>),
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
      map(signer => this.assetBasicService.contract(assetAddress, signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.populateTransaction.setInfo(infoHash, overrides)),
      switchMap(tx => this.signerService.sendTransaction(tx)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
    )
  }

  create(data: CreateAssetData, flavor: AssetFlavor): Observable<string | undefined> {
    return of(data).pipe(
      switchMap(data => {
        switch (flavor) {
          case AssetFlavor.TRANSFERABLE:
            return this.assetTransferableService.create(data)
          case AssetFlavor.ASSET:
          default:
            return this.assetBasicService.create(data)
        }
      }),
    )
  }

  transferTokensToCampaign(assetAddress: string, campaignAddress: string, amount: number) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.assetBasicService.contract(assetAddress, signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.populateTransaction.transfer(
        campaignAddress, this.stablecoin.parse(amount, 18), overrides),
      ),
      switchMap(tx => this.signerService.sendTransaction(tx)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
    )
  }

  balance(assetAddress: string): Observable<BigNumber> {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.assetBasicService.contract(assetAddress, signer)),
      switchMap(contract => from(contract.signer.getAddress()).pipe(
        switchMap(signerAddress => contract.balanceOf(signerAddress)),
      )),
    )
  }
}

export type AssetWithInfo = AssetState & IPFSAsset
export type TransferableAssetWithInfo = TransferableAssetState & IPFSAsset

interface CreateAssetData {
  issuer: string,
  ansName: string,
  initialTokenSupply: BigNumberish,
  whitelistRequiredForRevenueClaim: boolean,
  whitelistRequiredForLiquidationClaim: boolean,
  name: string,
  symbol: string,
  info: string,
}
