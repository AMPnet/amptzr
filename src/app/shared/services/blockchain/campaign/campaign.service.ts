import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of, throwError} from 'rxjs'
import {IpfsService, IPFSText} from '../../ipfs/ipfs.service'
import {PreferenceQuery} from '../../../../preference/state/preference.query'
import {StablecoinService} from '../stablecoin.service'
import {cid, IPFSCampaign, IPFSDocument, iso8601, ReturnFrequency} from '../../../../../../types/ipfs/campaign'
import {GasService} from '../gas.service'
import {BigNumberish, Signer} from 'ethers'
import {map, switchMap} from 'rxjs/operators'
import {DialogService} from '../../dialog.service'
import {SignerService} from '../../signer.service'
import {SessionQuery} from '../../../../session/state/session.query'
import {ErrorService} from '../../error.service'
import {IPFSAddResult} from '../../ipfs/ipfs.service.types'
import {Provider} from '@ethersproject/providers'
import {CampaignBasicService} from './campaign-basic.service'
import {CampaignFlavor} from '../flavors'
import {CampaignCommonState} from './campaign.common'


@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  constructor(private sessionQuery: SessionQuery,
              private ipfsService: IpfsService,
              private signerService: SignerService,
              private errorService: ErrorService,
              private dialogService: DialogService,
              private stablecoin: StablecoinService,
              private campaignBasicService: CampaignBasicService,
              private gasService: GasService) {
  }

  getCommonState(address: string, signerOrProvider: Signer | Provider): Observable<CampaignCommonState> {
    return of(this.campaignBasicService.contract(address, signerOrProvider)).pipe(
      switchMap(contract => contract.commonState()),
    )
  }

  getCampaignWithInfo(address: string, fullInfo = false): Observable<CampaignWithInfo> {
    return this.sessionQuery.provider$.pipe(
      switchMap(provider => this.getCommonState(address, provider)),
      switchMap(state => this.getCampaignInfo(state, fullInfo)),
    )
  }

  getCampaignInfo(state: CampaignCommonState, fullInfo = false): Observable<CampaignWithInfo> {
    return this.ipfsService.get<IPFSCampaign>(state.info).pipe(
      map(info => ({...state, infoData: info})),
      switchMap(campaign => fullInfo ? combineLatest([
        this.ipfsService.get<IPFSText>(campaign.infoData.description),
      ]).pipe(
        map(([description]) => ({
          ...campaign,
          infoData: {
            ...campaign.infoData,
            description: description.content,
          },
        })),
      ) : of(campaign)),
    )
  }

  uploadInfo(data: Partial<UploadInfoData>, campaign?: IPFSCampaign): Observable<IPFSAddResult> {
    return combineLatest([
      data.photo ? this.ipfsService.addFile(data.photo) : of(undefined),
      this.ipfsService.addText(data.description || ''),
      this.uploadMultipleDocuments(data.newDocuments),
    ]).pipe(
      switchMap(([photoIPFS, descriptionIPFS, newDocuments]) => this.ipfsService.addObject<IPFSCampaign>({
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
      })),
    )
  }

  updateInfo(campaignAddress: string, infoHash: string) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.campaignBasicService.contract(campaignAddress, signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.populateTransaction.setInfo(infoHash, overrides)),
      switchMap(tx => this.signerService.sendTransaction(tx)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
    )
  }

  create(data: CreateCampaignData, flavor: CampaignFlavor): Observable<string | undefined> {
    return of(data).pipe(
      switchMap(data => {
        switch (flavor) {
          case 'CfManagerSoftcapV1':
          default:
            return this.campaignBasicService.create(data)
        }
      }),
    )
  }

  invest(address: string, flavor: CampaignFlavor, amount: number) {
    switch (flavor) {
      case 'CfManagerSoftcapV1':
        return this.campaignBasicService.invest(address, amount)
      default:
        return throwError(`invest not implemented for campaign flavor ${flavor}`)
    }
  }

  cancelInvestment(address: string, flavor: CampaignFlavor) {
    switch (flavor) {
      case 'CfManagerSoftcapV1':
        return this.campaignBasicService.cancelInvestment(address)
      default:
        return throwError(`cancelInvestment not implemented for campaign flavor ${flavor}`)
    }
  }

  isWhitelistRequired(campaign: CampaignWithInfo): Observable<boolean> {
    switch (campaign.flavor) {
      case 'CfManagerSoftcapV1':
        return this.campaignBasicService.isWhitelistRequired(campaign.contractAddress)
      default:
        return of(false)
    }
  }

  stats(address: string, flavor: CampaignFlavor): Observable<CampaignStats> {
    switch (flavor) {
      case 'CfManagerSoftcapV1':
      default:
        return this.campaignBasicService.stats(address)
    }
  }

  finalize(address: string, flavor: CampaignFlavor) {
    switch (flavor) {
      case 'CfManagerSoftcapV1':
      default:
        return this.campaignBasicService.finalize(address)
    }
  }

  alreadyInvested(address: string): Observable<number> {
    return combineLatest([
      of(this.campaignBasicService.contract(address, this.sessionQuery.provider)),
      this.signerService.ensureAuth,
    ]).pipe(
      switchMap(([contract, _signer]) =>
        contract.investmentAmount(this.sessionQuery.getValue().address!)),
      map(res => this.stablecoin.format(res)),
    )
  }

  private uploadMultipleDocuments(documents: File[] | undefined): Observable<IPFSDocument[]> {
    if (documents && documents.length > 0) {
      return combineLatest(documents.map(this.uploadDocument.bind(this)))
    }

    return of([])
  }

  private uploadDocument(document: File): Observable<IPFSDocument> {
    return this.ipfsService.addFile(document).pipe(
      map((ipfsResult) => {
        return {name: document.name, location: ipfsResult.path}
      }),
    )
  }
}

export type CampaignInfo = { infoData: IPFSCampaign }
export type CampaignWithInfo = CampaignCommonState & CampaignInfo

interface CreateCampaignData {
  slug: string,
  assetAddress: string,
  initialPricePerToken: BigNumberish,
  softCap: BigNumberish,
  minInvestment: BigNumberish,
  maxInvestment: BigNumberish,
  whitelistRequired: boolean,
  info: string,
}

interface UploadInfoData {
  name: string
  photo: File
  about: string
  description: cid
  startDate: iso8601
  endDate: iso8601
  return: {
    frequency?: ReturnFrequency,
    from?: number
    to?: number
  },
  documents: IPFSDocument[]
  newDocuments: File[]
  newsURLs: string[]
}

export interface CampaignStats {
  userMin: number
  userMax: number
  tokenBalance: number
  tokensSold: number
  softCap: number
  tokenPrice: number
  tokensAvailable: number
  valueInvested: number
  valueTotal: number
  valueToInvest: number
}
