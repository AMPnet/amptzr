import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {filter, first, map, shareReplay, switchMap, take} from 'rxjs/operators'
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
import {DialogService} from '../dialog.service'
import {GasService} from './gas.service'

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
              private signerService: SignerService,
              private dialogService: DialogService,
              private gasService: GasService,
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
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.populateTransaction.setInfo(infoHash, overrides)),
      switchMap(tx => this.signerService.sendTransaction(tx)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
    )
  }

  create(ansName: string, infoHash: string): Observable<string | undefined> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.factoryContract$,
    ]).pipe(
      first(),
      map(([signer, contract]) => contract.connect(signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => {
        const createData: CreateIssuerData = {
          owner: this.sessionQuery.getValue().address!,
          ansName: ansName,
          stablecoin: this.preferenceQuery.network.tokenizerConfig.defaultStableCoin,
          walletApprover: this.preferenceQuery.network.tokenizerConfig.defaultWalletApprover,
          info: infoHash,
        }

        return from(contract.populateTransaction.create(
          createData.owner, createData.ansName, createData.stablecoin,
          createData.walletApprover, createData.info, overrides,
        )).pipe(
          switchMap(tx => this.signerService.sendTransaction(tx)),
          switchMap(tx => this.dialogService.loading(
            from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
            'Processing transaction...',
          )),
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
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.populateTransaction.changeWalletApprover(walletApproverAddress, overrides)),
      switchMap(tx => this.signerService.sendTransaction(tx)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
    )
  }

  changeOwner(issuerAddress: string, ownerAddress: string) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(issuerAddress, signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.changeOwnership(ownerAddress, overrides)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
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
