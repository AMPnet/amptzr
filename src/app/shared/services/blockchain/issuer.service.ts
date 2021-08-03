import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {first, map, switchMap} from 'rxjs/operators'
import {Issuer, Issuer__factory, IssuerFactory, IssuerFactory__factory} from '../../../../../types/ethers-contracts'
import {withStatus} from '../../utils/observables'
import {SessionQuery} from '../../../session/state/session.query'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {BigNumber, providers, Signer} from 'ethers'
import {Provider} from '@ethersproject/providers'
import {IpfsService} from '../ipfs/ipfs.service'
import {IPFSIssuer} from '../../../../../types/ipfs/issuer'
import {IPFSAddResult} from '../ipfs/ipfs.service.types'
import {SignerService} from '../signer.service'

@Injectable({
  providedIn: 'root',
})
export class IssuerService {
  issuerFactory$ = this.sessionQuery.provider$.pipe(
    map(provider =>
      IssuerFactory__factory.connect(this.preferenceQuery.network.tokenizerConfig.issuerFactory, provider),
    ),
  )

  issuers$ = this.issuerFactory$.pipe(
    switchMap(issuerFactory => withStatus(
      from(issuerFactory.getInstances()).pipe(
        switchMap(issuers => combineLatest(
          issuers.map(issuer => this.getIssuerWithInfo(issuer, issuerFactory.provider))),
        )),
    )),
  )

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private signerService: SignerService,
              private ipfsService: IpfsService) {
  }

  contract(address: string, signerOrProvider: Signer | Provider): Issuer {
    return Issuer__factory.connect(address, signerOrProvider)
  }

  getState(address: string, signerOrProvider: Signer | Provider): Observable<IssuerState> {
    return of(this.contract(address, signerOrProvider)).pipe(
      // TODO: uncomment this when address will be available from getState()
      // switchMap(contract => contract.getState() as Promise<IssuerState>),
      switchMap(contract => from(contract.getState()).pipe(
        map(state => ({...state, address})),
      )),
    )
  }

  getIssuerWithInfo(address: string, signerOrProvider: Signer | Provider): Observable<IssuerWithInfo> {
    return this.getState(address, signerOrProvider).pipe(
      switchMap(state => this.ipfsService.get<IPFSIssuer>(state.info).pipe(
        map(info => ({...state, ...info})),
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

  updateInfo(address: string, infoHash: string) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(address, signer)),
      switchMap(contract => contract.setInfo(infoHash)),
      switchMap(tx => this.sessionQuery.provider.waitForTransaction(tx.hash)),
    )
  }

  create(infoHash: string): Observable<string | undefined> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.issuerFactory$,
    ]).pipe(
      first(),
      map(([signer, contract]) => contract.connect(signer)),
      switchMap(contract => {
        const createData: CreateIssuerData = {
          owner: this.sessionQuery.getValue().address!,
          stablecoin: this.preferenceQuery.network.tokenizerConfig.defaultStableCoin,
          walletApprover: this.preferenceQuery.network.tokenizerConfig.defaultWalletApprover,
          info: infoHash,
        }

        return from(contract.functions.create(
          createData.owner, createData.stablecoin,
          createData.walletApprover, createData.info,
        )).pipe(
          switchMap(tx => this.sessionQuery.provider.waitForTransaction(tx.hash)),
          map(receipt => this.getDeployedIssuer(receipt, contract)),
        )
      }),
    )
  }

  private getDeployedIssuer(receipt: providers.TransactionReceipt, contract: IssuerFactory): string | undefined {
    return receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog(log)
        } catch (_e) {
          return undefined
        }
      })
      .find(log => log?.name === contract.interface.getEvent('IssuerCreated').name)
      ?.args?.issuer
  }
}

export interface IssuerState {
  address: string
  id: BigNumber;
  owner: string;
  stablecoin: string;
  walletApprover: string;
  info: string;
}

export type IssuerWithInfo = IssuerState & IPFSIssuer

interface CreateIssuerData {
  owner: string,
  stablecoin: string,
  walletApprover: string,
  info: string,
}
