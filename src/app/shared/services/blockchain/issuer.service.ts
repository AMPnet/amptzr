import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {first, map, shareReplay, switchMap, take} from 'rxjs/operators'
import {Issuer, Issuer__factory, IssuerFactory, IssuerFactory__factory} from '../../../../../types/ethers-contracts'
import {SessionQuery} from '../../../session/state/session.query'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {BigNumber, Signer} from 'ethers'
import {Provider} from '@ethersproject/providers'
import {IpfsService} from '../ipfs/ipfs.service'
import {IPFSIssuer} from '../../../../../types/ipfs/issuer'
import {IPFSAddResult} from '../ipfs/ipfs.service.types'
import {SignerService} from '../signer.service'
import {findLog} from '../../utils/ethersjs'
import {WithStatus, withStatus} from '../../utils/observables'

@Injectable({
  providedIn: 'root',
})
export class IssuerService {
  factoryContract$: Observable<IssuerFactory> = this.sessionQuery.provider$.pipe(
    map(provider =>
      IssuerFactory__factory.connect(this.preferenceQuery.network.tokenizerConfig.issuerFactory, provider),
    ),
  )

  issuers$: Observable<IssuerWithInfo[]> = this.factoryContract$.pipe(
    switchMap(contract => from(contract.getInstances()).pipe(
      switchMap(issuers => issuers.length === 0 ? of([]) : combineLatest(
        issuers.map(issuer => this.getIssuerWithInfo(issuer))),
      ))),
  )

  issuer$: Observable<IssuerWithInfo> = this.preferenceQuery.issuer$.pipe(
    switchMap(issuer => this.getIssuerWithInfo(issuer.address)),
    shareReplay(1),
  )

  issuerWithStatus$: Observable<WithStatus<IssuerWithInfo>> = withStatus(this.issuer$).pipe(
    shareReplay(1),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private signerService: SignerService,
              private ipfsService: IpfsService) {
  }

  contract(address: string, signerOrProvider: Signer | Provider): Issuer {
    return Issuer__factory.connect(address, signerOrProvider)
  }

  getAddressByName(ansName: string): Observable<string> {
    return this.factoryContract$.pipe(
      switchMap(contract => contract.namespace(ansName)),
    )
  }

  getState(address: string, signerOrProvider: Signer | Provider): Observable<IssuerState> {
    return of(this.contract(address, signerOrProvider)).pipe(
      switchMap(contract => contract.getState()),
    )
  }

  getIssuerWithInfo(address: string): Observable<IssuerWithInfo> {
    return this.sessionQuery.provider$.pipe(
      switchMap(provider => this.getState(address, provider).pipe(
        switchMap(state => this.ipfsService.get<IPFSIssuer>(state.info).pipe(
          map(info => ({...state, ...info})),
        )),
      )),
    )
  }

  uploadInfo(name: string, logo: File, issuer?: IPFSIssuer): Observable<IPFSAddResult> {
    return combineLatest([
      logo ? this.ipfsService.addFile(logo) : of(undefined),
    ]).pipe(
      switchMap(([logo]) => this.ipfsService.addObject<IPFSIssuer>({
        version: 0.1,
        name: name || issuer?.name || '',
        logo: logo?.path || issuer?.logo || '',
      })),
    )
  }

  updateInfo(issuerAddress: string, infoHash: string) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(issuerAddress, signer)),
      switchMap(contract => contract.setInfo(infoHash)),
      switchMap(tx => this.sessionQuery.provider.waitForTransaction(tx.hash)),
    )
  }

  create(ansName: string, infoHash: string): Observable<string | undefined> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.factoryContract$,
    ]).pipe(
      first(),
      map(([signer, contract]) => contract.connect(signer)),
      switchMap(contract => {
        const createData: CreateIssuerData = {
          owner: this.sessionQuery.getValue().address!,
          ansName: ansName,
          stablecoin: this.preferenceQuery.network.tokenizerConfig.defaultStableCoin,
          walletApprover: this.preferenceQuery.network.tokenizerConfig.defaultWalletApprover,
          info: infoHash,
        }

        return from(contract.functions.create(
          createData.owner, createData.ansName, createData.stablecoin,
          createData.walletApprover, createData.info,
        )).pipe(
          switchMap(tx => this.sessionQuery.provider.waitForTransaction(tx.hash)),
          map(receipt => findLog(
            receipt, contract, contract.interface.getEvent('IssuerCreated'),
          )?.args?.issuer),
        )
      }),
    )
  }

  isWalletApproved(address: string): Observable<boolean> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.sessionQuery.provider$,
      this.issuer$,
    ]).pipe(
      map(([_signer, provider, issuer]) => this.contract(issuer.contractAddress, provider)),
      switchMap(contract => contract.isWalletApproved(address)),
      take(1),
    )
  }

  changeWalletApprover(issuerAddress: string, walletApproverAddress: string) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(issuerAddress, signer)),
      switchMap(contract => contract.changeWalletApprover(walletApproverAddress)),
      switchMap(tx => this.sessionQuery.provider.waitForTransaction(tx.hash)),
    )
  }
}

export interface IssuerState {
  id: BigNumber;
  contractAddress: string;
  ansName: string;
  createdBy: string;
  owner: string;
  stablecoin: string;
  walletApprover: string;
  info: string;
}

export type IssuerWithInfo = IssuerState & IPFSIssuer

interface CreateIssuerData {
  owner: string,
  ansName: string,
  stablecoin: string,
  walletApprover: string,
  info: string,
}
