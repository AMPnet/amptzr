import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {
  AssetTransferable,
  AssetTransferable__factory,
  AssetTransferableFactory,
  AssetTransferableFactory__factory,
} from '../../../../../types/ethers-contracts'
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
import {ErrorService} from '../error.service'
import {GasService} from './gas.service'

@Injectable({
  providedIn: 'root',
})
export class FtAssetService {
  factoryContract$: Observable<AssetTransferableFactory> = this.sessionQuery.provider$.pipe(
    map(provider =>
      AssetTransferableFactory__factory.connect(
        this.preferenceQuery.network.tokenizerConfig.assetTransferableFactory, provider,
      )),
  )

  constructor(private sessionQuery: SessionQuery,
              private ipfsService: IpfsService,
              private signerService: SignerService,
              private dialogService: DialogService,
              private stablecoin: StablecoinService,
              private errorService: ErrorService,
              private gasService: GasService,
              private preferenceQuery: PreferenceQuery) {
  }

  getAssets(issuer: string): Observable<FtAssetWithInfo[]> {
    return this.factoryContract$.pipe(
      switchMap(contract => from(contract.getInstancesForIssuer(issuer)).pipe(
        switchMap(assets => assets.length === 0 ? of([]) : combineLatest(
          assets.map(asset => this.getAssetWithInfo(asset))),
        ))),
    )
  }

  contract(address: string, signerOrProvider: Signer | Provider): AssetTransferable {
    return AssetTransferable__factory.connect(address, signerOrProvider)
  }

  getState(address: string, signerOrProvider: Signer | Provider): Observable<FtAssetState> {
    return of(this.contract(address, signerOrProvider)).pipe(
      switchMap(contract => contract.getState()),
    )
  }

  getAssetWithInfo(address: string, fullInfo = false): Observable<FtAssetWithInfo> {
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
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.setInfo(infoHash, overrides)),
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
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => {
        const creator = this.sessionQuery.getValue().address!

        return from(contract.create({
          creator: creator,
          issuer: data.issuer,
          apxRegistry: this.preferenceQuery.network.tokenizerConfig.apxRegistry,
          ansName: data.ansName,
          initialTokenSupply: data.initialTokenSupply,
          whitelistRequiredForRevenueClaim: data.whitelistRequiredForRevenueClaim,
          whitelistRequiredForLiquidationClaim: data.whitelistRequiredForLiquidationClaim,
          name: data.name,
          symbol: data.symbol,
          info: data.info,
          childChainManager: this.preferenceQuery.network.tokenizerConfig.childChainManager,
        }, overrides)).pipe(
          this.errorService.handleError(),
          switchMap(tx => this.dialogService.loading(
            from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
            'Processing transaction...',
          )),
          map(receipt => findLog(
            receipt, contract, contract.interface.getEvent('AssetTransferableCreated'),
          )?.args?.asset),
        )
      }),
    )
  }

  transferTokensToCampaign(assetAddress: string, campaignAddress: string, amount: number) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(assetAddress, signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.transfer(
        campaignAddress, this.stablecoin.parse(amount, 18), overrides),
      ),
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

export interface FtAssetState {
  id: BigNumber;
  contractAddress: string;
  ansName: string;
  ansId: BigNumber;
  createdBy: string;
  owner: string;
  initialTokenSupply: BigNumber;
  whitelistRequiredForRevenueClaim: boolean;
  whitelistRequiredForLiquidationClaim: boolean;
  assetApprovedByIssuer: boolean;
  issuer: string;
  apxRegistry: string;
  info: string;
  name: string;
  symbol: string;
  totalAmountRaised: BigNumber;
  totalTokensSold: BigNumber;
  highestTokenSellPrice: BigNumber;
  liquidated: boolean;
  liquidationFundsTotal: BigNumber;
  liquidationTimestamp: BigNumber;
  liquidationFundsClaimed: BigNumber;
  childChainManager: string;
}

export type FtAssetWithInfo = FtAssetState & IPFSAsset

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
