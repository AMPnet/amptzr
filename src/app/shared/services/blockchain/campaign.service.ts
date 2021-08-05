import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {
  CfManagerSoftcap,
  CfManagerSoftcap__factory,
  CfManagerSoftcapFactory,
  CfManagerSoftcapFactory__factory,
} from '../../../../../types/ethers-contracts'
import {first, map, switchMap} from 'rxjs/operators'
import {SessionQuery} from '../../../session/state/session.query'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {BigNumber, BigNumberish, Signer} from 'ethers'
import {Provider} from '@ethersproject/providers'
import {IpfsService, IPFSText} from '../ipfs/ipfs.service'
import {SignerService} from '../signer.service'
import {findLog} from '../../utils/ethersjs'
import {IPFSAddResult} from '../ipfs/ipfs.service.types'
import {cid, IPFSCampaign} from '../../../../../types/ipfs/campaign'

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  factoryContract$: Observable<CfManagerSoftcapFactory> = this.sessionQuery.provider$.pipe(
    map(provider => CfManagerSoftcapFactory__factory.connect(
      this.preferenceQuery.network.tokenizerConfig.cfManagerFactory, provider,
    )),
  )

  constructor(private sessionQuery: SessionQuery,
              private ipfsService: IpfsService,
              private signerService: SignerService,
              private preferenceQuery: PreferenceQuery) {
  }

  getCampaigns(asset: string): Observable<CampaignWithInfo[]> {
    return this.factoryContract$.pipe(
      switchMap(contract => from(contract.getInstancesForAsset(asset)).pipe(
        switchMap(campaigns => campaigns.length === 0 ? of([]) : combineLatest(
          campaigns.map(campaign => this.getCampaignWithInfo(campaign))),
        ))),
    )
  }

  contract(address: string, signerOrProvider: Signer | Provider): CfManagerSoftcap {
    return CfManagerSoftcap__factory.connect(address, signerOrProvider)
  }

  getState(address: string, signerOrProvider: Signer | Provider): Observable<CampaignState> {
    return of(this.contract(address, signerOrProvider)).pipe(
      switchMap(contract => contract.getState()),
    )
  }

  getCampaignWithInfo(address: string, fullInfo = false): Observable<CampaignWithInfo> {
    return this.sessionQuery.provider$.pipe(
      switchMap(provider => this.getState(address, provider)),
      switchMap(state => this.ipfsService.get<IPFSCampaign>(state.info).pipe(
        map(info => ({...state, ...info})),
      )),
      switchMap(campaign => fullInfo ? combineLatest([
        this.ipfsService.get<IPFSText>(campaign.description),
      ]).pipe(
        map(([description]) => ({
          ...campaign,
          description: description.content,
        })),
      ) : of(campaign)),
    )
  }

  uploadInfo(data: Partial<UploadInfoData>, campaign?: IPFSCampaign): Observable<IPFSAddResult> {
    return combineLatest([
      data.photo ? this.ipfsService.addFile(data.photo) : of(undefined),
      this.ipfsService.addText(data.description || ''),
    ]).pipe(
      switchMap(([photoIPFS, descriptionIPFS]) => this.ipfsService.addObject<IPFSCampaign>({
        version: 0.1,
        name: data.name || '',
        photo: photoIPFS?.path || campaign?.photo || '',
        about: data.about || '',
        description: descriptionIPFS.path || campaign?.description || '',
        startDate: new Date(Date.now()).toISOString(),
        endDate: new Date(Date.now()).toISOString(),
        return: data.return || {},
        documents: data.documents || [],
        newsURLs: data.newsURLs || [],
      })),
    )
  }

  updateInfo(campaignAddress: string, infoHash: string) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(campaignAddress, signer)),
      switchMap(contract => contract.setInfo(infoHash)),
      switchMap(tx => this.sessionQuery.provider.waitForTransaction(tx.hash)),
    )
  }

  create(data: CreateCampaignData): Observable<string | undefined> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.factoryContract$,
    ]).pipe(
      first(),
      map(([signer, contract]) => contract.connect(signer)),
      switchMap(contract => {
        const owner = this.sessionQuery.getValue().address!

        return from(contract.functions.create(
          owner, data.assetAddress,
          data.initialPricePerToken, data.softCap,
          data.minInvestment, data.maxInvestment,
          data.whitelistRequired, data.info,
        )).pipe(
          switchMap(tx => this.sessionQuery.provider.waitForTransaction(tx.hash)),
          map(receipt => findLog(
            receipt, contract, contract.interface.getEvent('CfManagerSoftcapCreated'),
          )?.args?.cfManager),
        )
      }),
    )
  }
}

export interface CampaignState {
  id: BigNumber;
  contractAddress: string;
  createdBy: string;
  owner: string;
  asset: string;
  issuer: string;
  tokenPrice: BigNumber;
  softCap: BigNumber;
  minInvestment: BigNumber;
  maxInvestment: BigNumber;
  whitelistRequired: boolean;
  finalized: boolean;
  cancelled: boolean;
  totalClaimableTokens: BigNumber;
  totalInvestorsCount: BigNumber;
  totalClaimsCount: BigNumber;
  totalFundsRaised: BigNumber;
  info: string;
}

export type CampaignWithInfo = CampaignState & IPFSCampaign

interface CreateCampaignData {
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
  description: string
  startDate: string
  endDate: string
  return: {
    from?: number
    to?: number
  },
  documents: {
    name: string,
    location: string | cid
  }[]
  newsURLs: string[]
}
