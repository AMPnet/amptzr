import { IpfsService, IPFSText } from '../../ipfs/ipfs.service'
import { PreferenceQuery } from '../../../../preference/state/preference.query'
import { StablecoinBigNumber, StablecoinService } from '../stablecoin.service'
import { GasService } from '../gas.service'
import { BigNumber, BigNumberish, Signer } from 'ethers'
import { combineLatest, from, Observable, of, throwError } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { IPFSAsset } from '../../../../../../types/ipfs/asset'
import { Injectable } from '@angular/core'
import { DialogService } from '../../dialog.service'
import { SignerService } from '../../signer.service'
import { SessionQuery } from '../../../../session/state/session.query'
import { IPFSAddResult } from '../../ipfs/ipfs.service.types'
import { AssetBasicService, AssetState } from './asset-basic.service'
import { Provider } from '@ethersproject/providers'
import {
  AssetTransferableService,
  TransferableAssetState,
} from './asset-transferable.service'
import { AssetFlavor } from '../flavors'
import { AssetCommonState } from './asset.common'
import { AssetSimpleService, SimpleAssetState } from './asset-simple.service'
import { TokenPriceBigNumber } from '../../../utils/token-price'
import { ConversionService } from '../../conversion.service'
import { Structs } from '../../../../../../types/ethers-contracts/Asset'

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  constructor(
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private assetBasicService: AssetBasicService,
    private assetTransferableService: AssetTransferableService,
    private assetSimpleService: AssetSimpleService,
    private ipfsService: IpfsService,
    private signerService: SignerService,
    private dialogService: DialogService,
    private stablecoin: StablecoinService,
    private conversion: ConversionService,
    private gasService: GasService
  ) {}

  getCommonState(
    address: string,
    signerOrProvider: Signer | Provider
  ): Observable<Structs.AssetCommonStateStructOutput> {
    return of(this.assetBasicService.contract(address, signerOrProvider)).pipe(
      switchMap((contract) => contract.commonState())
    )
  }

  getState(
    address: string,
    flavor: AssetFlavor,
    signerOrProvider: Signer | Provider
  ): Observable<AssetState | TransferableAssetState | SimpleAssetState> {
    return of(address).pipe(
      switchMap((address) => {
        switch (flavor) {
          case AssetFlavor.TRANSFERABLE:
            return this.assetTransferableService.getState(
              address,
              signerOrProvider
            )
          case AssetFlavor.SIMPLE:
            return this.assetSimpleService.getState(address, signerOrProvider)
          case AssetFlavor.BASIC:
            return this.assetBasicService.getState(address, signerOrProvider)
          default:
            return throwError(
              () => `getState not implemented for asset flavor ${flavor}`
            )
        }
      })
    )
  }

  getAssetWithInfo(
    address: string,
    fullInfo = false
  ): Observable<CommonAssetWithInfo> {
    return this.sessionQuery.provider$.pipe(
      switchMap((provider) => this.getCommonState(address, provider)),
      switchMap((asset) => this.getAssetInfo(asset, fullInfo))
    )
  }

  getAssetInfo(
    asset: AssetCommonState,
    fullInfo = false
  ): Observable<CommonAssetWithInfo> {
    return of(asset).pipe(
      switchMap((state) =>
        this.ipfsService
          .get<IPFSAsset>(state.info)
          .pipe(map((info) => ({ ...state, infoData: info })))
      ),
      switchMap((assetWithInfo) =>
        fullInfo
          ? combineLatest([
              this.ipfsService.get<IPFSText>(
                assetWithInfo.infoData.description
              ),
            ]).pipe(
              map(([descriptionRes]) => ({
                ...assetWithInfo,
                infoData: {
                  ...assetWithInfo.infoData,
                  descriptionData: descriptionRes.content,
                },
              }))
            )
          : of(assetWithInfo)
      )
    )
  }

  uploadInfo(
    logo: File,
    description?: string,
    asset?: IPFSAsset
  ): Observable<IPFSAddResult> {
    return combineLatest([
      logo ? this.ipfsService.addFile(logo) : of(undefined),
      description
        ? this.ipfsService.addText(description)
        : of({} as Partial<IPFSAddResult>),
    ]).pipe(
      switchMap(([logoIPFS, descriptionIPFS]) =>
        this.ipfsService.addObject<IPFSAsset>({
          version: 0.1,
          logo: logoIPFS?.path || asset?.logo || '',
          description: descriptionIPFS.path || asset?.description || '',
          documents: [], // TODO: implement documents upload
        })
      )
    )
  }

  updateInfo(assetAddress: string, infoHash: string) {
    return this.signerService.ensureAuth.pipe(
      map((signer) => this.assetBasicService.contract(assetAddress, signer)),
      switchMap((contract) =>
        combineLatest([of(contract), this.gasService.overrides])
      ),
      switchMap(([contract, overrides]) =>
        contract.populateTransaction.setInfo(infoHash, overrides)
      ),
      switchMap((tx) => this.signerService.sendTransaction(tx)),
      switchMap((tx) =>
        this.dialogService.loading(
          from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
          'Processing transaction...'
        )
      )
    )
  }

  create(
    data: CreateAssetData,
    flavor: AssetFlavor
  ): Observable<string | undefined> {
    return of(data).pipe(
      switchMap((data) => {
        switch (flavor) {
          case AssetFlavor.TRANSFERABLE:
            return this.assetTransferableService.create(data)
          case AssetFlavor.SIMPLE:
            return this.assetSimpleService.create(data)
          case AssetFlavor.BASIC:
            return this.assetBasicService.create(data)
          default:
            return throwError(
              () => `create not implemented for asset flavor ${flavor}`
            )
        }
      })
    )
  }

  transferTokensToCampaign(
    assetAddress: string,
    campaignAddress: string,
    stablecoin: StablecoinBigNumber,
    tokenPrice: TokenPriceBigNumber
  ) {
    const tokens = this.conversion.calcTokens(stablecoin, tokenPrice)

    return this.signerService.ensureAuth.pipe(
      map((signer) => this.assetBasicService.contract(assetAddress, signer)),
      switchMap((contract) =>
        combineLatest([of(contract), this.gasService.overrides])
      ),
      switchMap(([contract, overrides]) =>
        contract.populateTransaction.transfer(
          campaignAddress,
          tokens.toString(),
          overrides
        )
      ),
      switchMap((tx) => this.signerService.sendTransaction(tx)),
      switchMap((tx) =>
        this.dialogService.loading(
          from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
          'Processing transaction...'
        )
      )
    )
  }

  balance(assetAddress: string): Observable<BigNumber> {
    return this.signerService.ensureAuth.pipe(
      map((signer) => this.assetBasicService.contract(assetAddress, signer)),
      switchMap((contract) =>
        from(contract.signer.getAddress()).pipe(
          switchMap((signerAddress) => contract.balanceOf(signerAddress))
        )
      )
    )
  }

  changeOwner(assetAddress: string, ownerAddress: string, flavor: AssetFlavor) {
    switch (flavor) {
      case AssetFlavor.BASIC:
        return this.assetBasicService.changeOwner(assetAddress, ownerAddress)
      case AssetFlavor.TRANSFERABLE:
        return this.assetTransferableService.changeOwner(
          assetAddress,
          ownerAddress
        )
      case AssetFlavor.SIMPLE:
        return this.assetSimpleService.changeOwner(assetAddress, ownerAddress)
    }
  }
}

export type AssetInfo = { infoData: IPFSAsset }
export type CommonAssetWithInfo = AssetCommonState & AssetInfo

interface CreateAssetData {
  issuer: string
  slug: string
  initialTokenSupply: BigNumberish
  whitelistRequiredForRevenueClaim: boolean
  whitelistRequiredForLiquidationClaim: boolean
  name: string
  symbol: string
  info: string
}
