import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {filter, map, shareReplay, switchMap} from 'rxjs/operators'
import {WithStatus, withStatus} from '../../../utils/observables'
import {PreferenceQuery} from '../../../../preference/state/preference.query'
import {IpfsService} from '../../ipfs/ipfs.service'
import {DialogService} from '../../dialog.service'
import {SignerService} from '../../signer.service'
import {IPFSIssuer} from '../../../../../../types/ipfs/issuer'
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
  issuers$: Observable<IssuerWithInfo[]> = this.queryService.issuers$.pipe(
    switchMap(issuers => issuers.length === 0 ? of([]) : combineLatest(
      issuers.map(issuer => this.getIssuerInfo(issuer.issuer))),
    ),
  )

  issuerWithStatus$: Observable<WithStatus<IssuerWithInfo>> = this.preferenceQuery.issuer$.pipe(
    switchMap(issuer => withStatus(this.getIssuerWithInfo(issuer.address))),
    shareReplay(1),
  )

  issuer$: Observable<IssuerWithInfo> = this.issuerWithStatus$.pipe(
    filter(issuerWithStatus => !!issuerWithStatus.value),
    map(issuerWithStatus => issuerWithStatus.value!),
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

  getState(
    address: string, flavor: IssuerFlavor, signerOrProvider: Signer | Provider,
  ): Observable<IssuerBasicState> {
    return of(address).pipe(
      switchMap(address => {
        switch (flavor) {
          case 'IssuerV1':
          default:
            return this.issuerBasicService.getState(address, signerOrProvider)
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

  uploadInfo(name: string, logo: File, rampApiKey: string, issuer?: IPFSIssuer): Observable<IPFSAddResult> {
    return combineLatest([
      logo ? this.ipfsService.addFile(logo) : of(undefined),
    ]).pipe(
      switchMap(([logo]) => this.ipfsService.addObject<IPFSIssuer>({
        version: 0.1,
        name: name || issuer?.name || '',
        logo: logo?.path || issuer?.logo || '',
        rampApiKey: rampApiKey || issuer?.rampApiKey || '',
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
}

export type IssuerInfo = { infoData: IPFSIssuer }
export type IssuerWithInfo = IssuerCommonState & IssuerInfo

interface CreateIssuerData {
  mappedName: string,
  info: string,
}
