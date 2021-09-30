import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of, throwError} from 'rxjs'
import {filter, map, shareReplay, switchMap} from 'rxjs/operators'
import {WithStatus, withStatus} from '../../../utils/observables'
import {PreferenceQuery} from '../../../../preference/state/preference.query'
import {IpfsService} from '../../ipfs/ipfs.service'
import {DialogService} from '../../dialog.service'
import {SignerService} from '../../signer.service'
import {IPFSIssuer, IPFSOffersDisplaySettings} from '../../../../../../types/ipfs/issuer'
import {SessionQuery} from '../../../../session/state/session.query'
import {GasService} from '../gas.service'
import {Signer} from 'ethers'
import {IPFSAddResult} from '../../ipfs/ipfs.service.types'
import {Provider} from '@ethersproject/providers'
import {NameService} from '../name.service'
import {QueryService} from '../query.service'
import {IssuerBasicService, IssuerBasicState} from './issuer-basic.service'
import {IssuerCommonState} from './issuer.common'
import {IssuerFlavor} from '../flavors'

@Injectable({
  providedIn: 'root',
})
export class IssuerService {
  issuerWithStatus$: Observable<WithStatus<IssuerWithInfo>> = this.preferenceQuery.issuer$.pipe(
    switchMap(issuer => withStatus(this.getIssuerWithInfo(issuer.address))),
    shareReplay(1),
  )

  issuer$: Observable<IssuerWithInfo> = this.issuerWithStatus$.pipe(
    filter(issuerWithStatus => !!issuerWithStatus.value),
    map(issuerWithStatus => issuerWithStatus.value!),
    shareReplay(1),
  )

  offersDisplaySettings$: Observable<IPFSOffersDisplaySettings> = this.issuer$.pipe(
    switchMap(issuer => this.ipfsService
      .get<Partial<IPFSOffersDisplaySettings>>(issuer.infoData.offersDisplaySettings || '')
      .pipe(
        map((displaySettings) => ({
          hiddenOffers: displaySettings.hiddenOffers || []
        }))
      )),
    shareReplay(1),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private issuerBasicService: IssuerBasicService,
              private nameService: NameService,
              private queryService: QueryService,
              private signerService: SignerService,
              private dialogService: DialogService,
              private gasService: GasService,
              private ipfsService: IpfsService) {
  }

  getCommonState(address: string, signerOrProvider: Signer | Provider): Observable<IssuerCommonState> {
    return of(this.issuerBasicService.contract(address, signerOrProvider)).pipe(
      switchMap(contract => contract.commonState()),
    )
  }

  getState(address: string, flavor: IssuerFlavor): Observable<IssuerBasicState> {
    return of(address).pipe(
      switchMap(address => {
        switch (flavor) {
          case 'IssuerV1':
            return this.issuerBasicService.getState(address)
          default:
            return throwError(`getState not implemented issuer flavor ${flavor}`)
        }
      }),
    )
  }

  getIssuerWithInfo(address: string): Observable<IssuerWithInfo> {
    return this.sessionQuery.provider$.pipe(
      switchMap(provider => this.getCommonState(address, provider).pipe(
        switchMap(state => this.getIssuerInfo(state)),
      )),
    )
  }

  getIssuerInfo(issuer: IssuerCommonState): Observable<IssuerWithInfo> {
    return this.ipfsService.get<IPFSIssuer>(issuer.info).pipe(
      map(info => ({...issuer, infoData: info})),
    )
  }

  uploadOffersDisplaySettings(
    displaySettings: IPFSOffersDisplaySettings,
    issuer: IPFSIssuer
  ): Observable<IPFSAddResult> {
    return this.ipfsService.addObject<IPFSOffersDisplaySettings>(displaySettings).pipe(
      switchMap(displaySettings => this.ipfsService.addObject<IPFSIssuer>({
        ...issuer,
        offersDisplaySettings: displaySettings.path,
      })),
    )
  }

  uploadInfo(name: string, logo: File, rampApiKey: string, issuer?: IPFSIssuer): Observable<IPFSAddResult> {
    return combineLatest([
      logo ? this.ipfsService.addFile(logo) : of(undefined),
    ]).pipe(
      switchMap(([logo]) => this.ipfsService.addObject<IPFSIssuer>({
        version: 0.1,
        name: name || issuer?.name || '',
        logo: logo?.path || issuer?.logo || '',
        rampApiKey: rampApiKey || issuer?.rampApiKey || '',
        offersDisplaySettings: issuer?.offersDisplaySettings || '',
      })),
    )
  }

  updateInfo(issuerAddress: string, infoHash: string) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.issuerBasicService.contract(issuerAddress, signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.populateTransaction.setInfo(infoHash, overrides)),
      switchMap(tx => this.signerService.sendTransaction(tx)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
    )
  }

  create(data: CreateIssuerData, flavor: IssuerFlavor): Observable<string | undefined> {
    return of(data).pipe(
      switchMap(data => {
        switch (flavor) {
          case 'IssuerV1':
          default:
            return this.issuerBasicService.create(data)
        }
      }),
    )
  }

  isWalletApproved(address: string): Observable<boolean> {
    return this.preferenceQuery.issuer$.pipe(
      switchMap(issuer => {
        switch (issuer.flavor) {
          case 'IssuerV1':
            return this.issuerBasicService.isWalletApproved(address)
          default:
            return of(true)
        }
      }),
    )
  }

  changeWalletApprover(issuerAddress: string, walletApproverAddress: string) {
    return this.preferenceQuery.issuer$.pipe(
      switchMap(issuer => {
        switch (issuer.flavor) {
          case 'IssuerV1':
            return this.issuerBasicService.changeWalletApprover(issuerAddress, walletApproverAddress)
          default:
            return throwError(`changeWalletApprover not implemented issuer flavor ${issuer.flavor}`)
        }
      }),
    )
  }

  changeOwner(issuerAddress: string, ownerAddress: string) {
    return this.preferenceQuery.issuer$.pipe(
      switchMap(issuer => {
        switch (issuer.flavor) {
          case 'IssuerV1':
            return this.issuerBasicService.changeOwner(issuerAddress, ownerAddress)
          default:
            return throwError(`changeOwner not implemented for issuer flavor ${issuer.flavor}`)
        }
      }),
    )
  }
}

export type IssuerInfo = { infoData: IPFSIssuer }
export type IssuerWithInfo = IssuerCommonState & IssuerInfo

interface CreateIssuerData {
  mappedName: string,
  info: string,
}
