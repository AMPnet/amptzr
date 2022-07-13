import { Injectable } from '@angular/core'
import { combineLatest, from, Observable, of } from 'rxjs'
import { first, map, switchMap } from 'rxjs/operators'
import { SessionQuery } from '../../../../session/state/session.query'
import { PreferenceQuery } from '../../../../preference/state/preference.query'
import { SignerService } from '../../signer.service'
import { GasService } from '../gas.service'
import { DialogService } from '../../dialog.service'
import { ErrorService } from '../../error.service'
import {
  AssetSimple,
  AssetSimple__factory,
  AssetSimpleFactory,
  AssetSimpleFactory__factory,
} from '../../../../../../types/ethers-contracts'
import { BigNumber, BigNumberish, Signer } from 'ethers'
import { Provider } from '@ethersproject/providers'
import { findLog } from '../../../utils/ethersjs'

@Injectable({
  providedIn: 'root',
})
export class AssetSimpleService {
  factoryContract$: Observable<AssetSimpleFactory> =
    this.sessionQuery.provider$.pipe(
      map((provider) =>
        AssetSimpleFactory__factory.connect(
          this.preferenceQuery.network.tokenizerConfig.assetFactory.simple,
          provider
        )
      )
    )

  constructor(
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private signerService: SignerService,
    private gasService: GasService,
    private dialogService: DialogService,
    private errorService: ErrorService
  ) {}

  contract(address: string, signerOrProvider: Signer | Provider): AssetSimple {
    return AssetSimple__factory.connect(address, signerOrProvider)
  }

  create(data: CreateSimpleAssetData): Observable<string | undefined> {
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
        const creator = this.preferenceQuery.getValue().address!

        return from(
          contract.populateTransaction.create(
            {
              creator: creator,
              issuer: data.issuer,
              mappedName: data.slug,
              nameRegistry:
                this.preferenceQuery.network.tokenizerConfig.nameRegistry,
              initialTokenSupply: data.initialTokenSupply,
              name: data.name,
              symbol: data.symbol,
              info: data.info,
            },
            overrides
          )
        ).pipe(
          switchMap((tx) => this.signerService.sendTransaction(tx)),
          this.errorService.handleError(),
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
                contract.interface.getEvent('AssetSimpleCreated')
              )?.args?.asset
          )
        )
      })
    )
  }

  getState(
    address: string,
    signerOrProvider: Signer | Provider
  ): Observable<SimpleAssetState> {
    return of(this.contract(address, signerOrProvider)).pipe(
      switchMap((contract) => contract.getState())
    )
  }

  changeOwner(assetAddress: string, ownerAddress: string) {
    return this.signerService.ensureAuth.pipe(
      map((signer) => this.contract(assetAddress, signer)),
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

interface CreateSimpleAssetData {
  issuer: string
  slug: string
  initialTokenSupply: BigNumberish
  name: string
  symbol: string
  info: string
}

export interface SimpleAssetState {
  flavor: string
  version: string
  contractAddress: string
  owner: string
  info: string
  name: string
  symbol: string
  totalSupply: BigNumber
  decimals: number
  issuer: string
  assetApprovedByIssuer: boolean
  totalAmountRaised: BigNumber
  totalTokensSold: BigNumber
}
