import { Injectable } from '@angular/core'
import { combineLatest, from, Observable, of } from 'rxjs'
import { first, map, switchMap, take } from 'rxjs/operators'
import { PreferenceQuery } from '../../../../preference/state/preference.query'
import { DialogService } from '../../dialog.service'
import {
  Issuer,
  Issuer__factory,
  IssuerFactory,
  IssuerFactory__factory,
} from '../../../../../../types/ethers-contracts'
import { SignerService } from '../../signer.service'
import { SessionQuery } from '../../../../session/state/session.query'
import { findLog } from '../../../utils/ethersjs'
import { GasService } from '../gas.service'
import { Signer } from 'ethers'
import { Provider } from '@ethersproject/providers'
import { IssuerCommonState } from './issuer.common'
import { IssuerFlavor } from '../flavors'

@Injectable({
  providedIn: 'root',
})
export class IssuerBasicService {
  factoryContract$: Observable<IssuerFactory> =
    this.sessionQuery.provider$.pipe(
      map((provider) =>
        IssuerFactory__factory.connect(
          this.preferenceQuery.network.tokenizerConfig.issuerFactory.basic,
          provider
        )
      )
    )

  constructor(
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private signerService: SignerService,
    private dialogService: DialogService,
    private gasService: GasService
  ) {}

  contract(address: string, signerOrProvider: Signer | Provider): Issuer {
    return Issuer__factory.connect(address, signerOrProvider)
  }

  getState(address: string): Observable<IssuerBasicState> {
    return this.sessionQuery.provider$.pipe(
      map((provider) => this.contract(address, provider)),
      switchMap((contract) => contract.getState())
    )
  }

  getStateFromCommon(
    issuer: IssuerCommonState
  ): Observable<IssuerBasicState | undefined> {
    return issuer.flavor === IssuerFlavor.BASIC
      ? this.getState(issuer.contractAddress)
      : of(undefined)
  }

  create(data: CreateBasicIssuerData): Observable<string | undefined> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.factoryContract$,
    ]).pipe(
      first(),
      map(([signer, contract]) => contract.connect(signer)),
      switchMap((contract) =>
        combineLatest([of(contract), this.gasService.overrides])
      ),
      switchMap(([contract, overrides]) => {
        const createData: CreateBasicContractIssuerData = {
          owner: this.preferenceQuery.getValue().address!,
          mappedName: data.mappedName,
          stablecoin: data.stablecoinAddress,
          walletApprover:
            this.preferenceQuery.network.tokenizerConfig.defaultWalletApprover,
          info: data.info,
          nameRegistry:
            this.preferenceQuery.network.tokenizerConfig.nameRegistry,
        }

        return from(
          contract.populateTransaction.create(
            createData.owner,
            createData.mappedName,
            createData.stablecoin,
            createData.walletApprover,
            createData.info,
            createData.nameRegistry,
            overrides
          )
        ).pipe(
          switchMap((tx) =>
            this.dialogService.waitingApproval(
              this.signerService.sendTransaction(tx)
            )
          ),
          switchMap((tx) =>
            this.dialogService.loading(
              from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
              'Processing transaction...'
            )
          ),
          map(
            (receipt) =>
              findLog(
                receipt,
                contract,
                contract.interface.getEvent('IssuerCreated')
              )?.args?.issuer
          )
        )
      })
    )
  }

  isWalletApproved(address: string): Observable<boolean> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.sessionQuery.provider$,
      this.preferenceQuery.issuer$,
    ]).pipe(
      take(1),
      map(([_signer, provider, issuer]) =>
        this.contract(issuer.address, provider)
      ),
      switchMap((contract) => contract.isWalletApproved(address))
    )
  }

  changeWalletApprover(issuerAddress: string, walletApproverAddress: string) {
    return this.signerService.ensureAuth.pipe(
      map((signer) => this.contract(issuerAddress, signer)),
      switchMap((contract) =>
        combineLatest([of(contract), this.gasService.overrides])
      ),
      switchMap(([contract, overrides]) =>
        contract.populateTransaction.changeWalletApprover(
          walletApproverAddress,
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

  changeOwner(issuerAddress: string, ownerAddress: string) {
    return this.signerService.ensureAuth.pipe(
      map((signer) => this.contract(issuerAddress, signer)),
      switchMap((contract) =>
        combineLatest([of(contract), this.gasService.overrides])
      ),
      switchMap(([contract, overrides]) =>
        contract.changeOwnership(ownerAddress, overrides)
      ),
      switchMap((tx) =>
        this.dialogService.loading(
          from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
          'Processing transaction...'
        )
      )
    )
  }
}

export interface IssuerBasicState {
  flavor: string
  version: string
  contractAddress: string
  owner: string
  stablecoin: string
  walletApprover: string
  info: string
}

interface CreateBasicIssuerData {
  mappedName: string
  stablecoinAddress: string
  info: string
}

interface CreateBasicContractIssuerData {
  owner: string
  mappedName: string
  stablecoin: string
  walletApprover: string
  info: string
  nameRegistry: string
}
