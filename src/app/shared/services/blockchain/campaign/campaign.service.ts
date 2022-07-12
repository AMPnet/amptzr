import { Injectable } from '@angular/core'
import { combineLatest, from, merge, Observable, of, throwError } from 'rxjs'
import { IpfsService, IPFSText } from '../../ipfs/ipfs.service'
import { StablecoinBigNumber, StablecoinService } from '../stablecoin.service'
import { GasService } from '../gas.service'
import { BigNumber, constants, Signer } from 'ethers'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { DialogService } from '../../dialog.service'
import { SignerService } from '../../signer.service'
import { SessionQuery } from '../../../../session/state/session.query'
import { ErrorService } from '../../error.service'
import { IPFSAddResult } from '../../ipfs/ipfs.service.types'
import { Provider } from '@ethersproject/providers'
import { CampaignBasicService } from './campaign-basic.service'
import { CampaignFlavor } from '../flavors'
import { CampaignCommonState } from './campaign.common'
import { CampaignVestingService } from './campaign-vesting.service'
import {
  IPFSCampaign,
  ReturnFrequency,
} from '../../../../../../types/ipfs/campaign'
import { cid, IPFSDocument } from '../../../../../../types/ipfs/common'
import { iso8601 } from '../../../../../../types/common'
import { TokenBigNumber } from '../../../utils/token'
import { TokenPriceBigNumber } from '../../../utils/token-price'
import { contractEvent } from '../../../utils/ethersjs'
import { PreferenceQuery } from '../../../../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  constructor(
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private ipfsService: IpfsService,
    private signerService: SignerService,
    private errorService: ErrorService,
    private dialogService: DialogService,
    private stablecoin: StablecoinService,
    private campaignBasicService: CampaignBasicService,
    private campaignVestingService: CampaignVestingService,
    private gasService: GasService
  ) {}

  getCommonState(
    address: string,
    signerOrProvider: Signer | Provider
  ): Observable<CampaignCommonState> {
    return of(
      this.campaignBasicService.contract(address, signerOrProvider)
    ).pipe(switchMap((contract) => contract.commonState()))
  }

  getCommonStateChanges$(
    address: string,
    first: CampaignCommonState | undefined = undefined
  ): Observable<CampaignCommonState> {
    return this.sessionQuery.provider$.pipe(
      switchMap((provider) =>
        of(this.campaignBasicService.contract(address, provider)).pipe(
          switchMap((contract) =>
            merge(
              of(first),
              contractEvent(contract, contract.filters.Invest()),
              contractEvent(contract, contract.filters.CancelInvestment())
            )
          ),
          switchMap(() => this.getCommonState(address, provider)),
          shareReplay({ bufferSize: 1, refCount: true })
        )
      )
    )
  }

  getCampaignWithInfo(
    address: string,
    fullInfo = false
  ): Observable<CampaignWithInfo> {
    return this.sessionQuery.provider$.pipe(
      switchMap((provider) => this.getCommonState(address, provider)),
      switchMap((state) => this.getCampaignInfo(state, fullInfo))
    )
  }

  getCampaignInfo(
    state: CampaignCommonState,
    fullInfo = false
  ): Observable<CampaignWithInfo> {
    return this.ipfsService.get<IPFSCampaign>(state.info).pipe(
      map((info) => ({ ...state, infoData: info })),
      switchMap((campaign) =>
        fullInfo
          ? combineLatest([
              this.ipfsService.get<IPFSText>(campaign.infoData.description),
            ]).pipe(
              map(([description]) => ({
                ...campaign,
                infoData: {
                  ...campaign.infoData,
                  description: description.content,
                },
              }))
            )
          : of(campaign)
      )
    )
  }

  uploadInfo(
    data: Partial<CampaignUploadInfoData>,
    campaign?: IPFSCampaign
  ): Observable<IPFSAddResult> {
    return combineLatest([
      data.photo ? this.ipfsService.addFile(data.photo) : of(undefined),
      this.ipfsService.addText(data.description || ''),
      this.uploadMultipleDocuments(data.newDocuments),
    ]).pipe(
      switchMap(([photoIPFS, descriptionIPFS, newDocuments]) =>
        this.ipfsService.addObject<IPFSCampaign>({
          version: 0.1,
          name: data.name || '',
          photo: photoIPFS?.path || campaign?.photo || '',
          about: data.about || '',
          description: descriptionIPFS.path || campaign?.description || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          return: data.return || {},
          documents: (data.documents || []).concat(newDocuments),
          newsURLs: data.newsURLs || [],
        })
      )
    )
  }

  updateInfo(campaignAddress: string, infoHash: string) {
    return this.signerService.ensureAuth.pipe(
      map((signer) =>
        this.campaignBasicService.contract(campaignAddress, signer)
      ),
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
    data: CreateCampaignData,
    flavor: CampaignFlavor
  ): Observable<string | undefined> {
    const realSoftCap = BigNumber.from(data.softCap)
      .div(data.initialPricePerToken)
      .mul(data.initialPricePerToken)

    data = {
      ...data,
      softCap: realSoftCap,
    }

    return of(data).pipe(
      switchMap((data) => {
        switch (flavor) {
          case CampaignFlavor.BASIC:
            return this.campaignBasicService.create(data)
          case CampaignFlavor.VESTING:
            return this.campaignVestingService.create(data)
          default:
            return throwError(
              () => `create not implemented for campaign flavor ${flavor}`
            )
        }
      })
    )
  }

  invest(address: string, flavor: CampaignFlavor, amount: StablecoinBigNumber) {
    switch (flavor) {
      case CampaignFlavor.BASIC:
        return this.campaignBasicService.invest(address, amount)
      case CampaignFlavor.VESTING:
        return this.campaignVestingService.invest(address, amount)
      default:
        return throwError(
          () => `invest not implemented for campaign flavor ${flavor}`
        )
    }
  }

  cancelInvestment(address: string, flavor: CampaignFlavor) {
    switch (flavor) {
      case CampaignFlavor.BASIC:
        return this.campaignBasicService.cancelInvestment(address)
      case CampaignFlavor.VESTING:
        return this.campaignVestingService.cancelInvestment(address)
      default:
        return throwError(
          () => `cancelInvestment not implemented for campaign flavor ${flavor}`
        )
    }
  }

  isWhitelistRequired(campaign: CampaignWithInfo): Observable<boolean> {
    switch (campaign.flavor) {
      case CampaignFlavor.BASIC:
        return this.campaignBasicService.isWhitelistRequired(
          campaign.contractAddress
        )
      case CampaignFlavor.VESTING:
        return this.campaignVestingService.isWhitelistRequired(
          campaign.contractAddress
        )
      default:
        return of(false)
    }
  }

  stats(address: string, flavor: CampaignFlavor): Observable<CampaignStats> {
    switch (flavor) {
      case CampaignFlavor.BASIC:
        return this.campaignBasicService.stats(address)
      case CampaignFlavor.VESTING:
        return this.campaignVestingService.stats(address)
      default:
        return throwError(
          () => `stats not implemented for campaign flavor ${flavor}`
        )
    }
  }

  finalize(address: string, flavor: CampaignFlavor) {
    switch (flavor) {
      case CampaignFlavor.BASIC:
        return this.campaignBasicService.finalize(address)
      case CampaignFlavor.VESTING:
        return this.campaignVestingService.finalize(address)
      default:
        return throwError(
          () => `finalize not implemented for campaign flavor ${flavor}`
        )
    }
  }

  alreadyInvested(address: string): Observable<StablecoinBigNumber> {
    if (!this.sessionQuery.isLoggedIn()) {
      return of(constants.Zero)
    }

    return combineLatest([
      of(
        this.campaignBasicService.contract(address, this.sessionQuery.provider)
      ),
      this.signerService.ensureAuth,
    ]).pipe(
      switchMap(([contract, _signer]) =>
        contract.investmentAmount(this.preferenceQuery.getValue().address!)
      )
    )
  }

  changeOwner(
    campaignAddress: string,
    ownerAddress: string,
    flavor: CampaignFlavor
  ) {
    switch (flavor) {
      case CampaignFlavor.BASIC:
        return this.campaignBasicService.changeOwner(
          campaignAddress,
          ownerAddress
        )
      case CampaignFlavor.VESTING:
        return this.campaignVestingService.changeOwner(
          campaignAddress,
          ownerAddress
        )
    }
  }

  private uploadMultipleDocuments(
    documents: File[] | undefined
  ): Observable<IPFSDocument[]> {
    if (documents && documents.length > 0) {
      return combineLatest(documents.map(this.uploadDocument.bind(this)))
    }

    return of([])
  }

  private uploadDocument(document: File): Observable<IPFSDocument> {
    return this.ipfsService.addFile(document).pipe(
      map((ipfsResult) => {
        return { name: document.name, location: ipfsResult.path }
      })
    )
  }
}

export type CampaignInfo = { infoData: IPFSCampaign }
export type CampaignWithInfo = CampaignCommonState & CampaignInfo

export interface CreateCampaignData {
  slug: string
  assetAddress: string
  initialPricePerToken: BigNumber
  softCap: BigNumber
  minInvestment: BigNumber
  maxInvestment: BigNumber
  whitelistRequired: boolean
  info: string
}

export interface CampaignUploadInfoData {
  name: string
  photo: File
  about: string
  description: cid
  startDate: iso8601
  endDate: iso8601
  return: {
    frequency?: ReturnFrequency
    from?: number
    to?: number
  }
  documents: IPFSDocument[]
  newDocuments: File[]
  newsURLs: string[]
}

export interface CampaignStats {
  userMin: StablecoinBigNumber
  userMax: StablecoinBigNumber
  tokenBalance: TokenBigNumber
  tokensSold: TokenBigNumber
  tokensClaimed: TokenBigNumber
  softCap: StablecoinBigNumber
  tokenPrice: TokenPriceBigNumber
  tokensAvailable: TokenBigNumber
  valueInvested: StablecoinBigNumber
  valueTotal: StablecoinBigNumber
  valueToInvest: StablecoinBigNumber
  softCapReached: boolean
}
