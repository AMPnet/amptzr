import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {map, switchMap} from 'rxjs/operators'
import {Issuer, Issuer__factory, IssuerFactory__factory} from '../../../../../types/ethers-contracts'
import {Networks} from '../../networks'
import {withStatus} from '../../utils/observables'
import {SessionQuery} from '../../../session/state/session.query'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {BigNumber, Signer} from 'ethers'
import {Provider} from '@ethersproject/providers'
import {IpfsService} from '../ipfs/ipfs.service'
import {IPFSIssuer} from '../../../../../types/ipfs/issuer'
import {IPFSAddResult} from '../ipfs/ipfs.service.types'

@Injectable({
  providedIn: 'root',
})
export class IssuerService {
  issuers$ = combineLatest([
    this.sessionQuery.provider$,
    this.preferenceQuery.select('chainID'),
  ]).pipe(
    map(([provider, chainID]) =>
      IssuerFactory__factory.connect(Networks[chainID].factoryConfig.issuer, provider),
    ),
    switchMap(issuerFactory => withStatus(
      from(issuerFactory.getInstances()).pipe(
        switchMap(issuers => combineLatest(
          issuers.map(issuer => this.getIssuerWithInfo(issuer, issuerFactory.provider))),
        )),
    )),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private ipfsService: IpfsService) {
  }

  contract(address: string, signerOrProvider: Signer | Provider): Issuer {
    return Issuer__factory.connect(address, signerOrProvider)
  }

  getState(address: string, signerOrProvider: Signer | Provider): Observable<IssuerState> {
    return of(this.contract(address, signerOrProvider)).pipe(
      switchMap(contract => contract.getState() as Promise<IssuerState>),
    )
  }

  getIssuerWithInfo(address: string, signerOrProvider: Signer | Provider): Observable<IssuerWithInfo> {
    return this.getState(address, signerOrProvider).pipe(
      switchMap(state => this.ipfsService.get<IPFSIssuer>(state.info).pipe(
        map(info => ({...state, ...info})),
      )),
    )
  }

  uploadInfo(name: string, logo: File, issuer: IPFSIssuer): Observable<IPFSAddResult> {
    return combineLatest([
      logo ? this.ipfsService.addFile(logo) : of(undefined),
    ]).pipe(
      switchMap(([logo]) => this.ipfsService.addObject<IPFSIssuer>({
        version: 0.1,
        name: name ?? issuer.name,
        logo: logo?.path || issuer.logo,
      })),
    )
  }

  updateInfo(address: string, infoHash: string, signer: Signer) {
    return of(this.contract(address, signer)).pipe(
      switchMap(contract => contract.setInfo(infoHash)),
      switchMap(tx => this.sessionQuery.provider.waitForTransaction(tx.hash)),
    )
  }
}

export interface IssuerState {
  // address: string // TODO: will be added in the next release
  id: BigNumber;
  owner: string;
  stablecoin: string;
  walletApprover: string;
  info: string;
}

export type IssuerWithInfo = IssuerState & IPFSIssuer
