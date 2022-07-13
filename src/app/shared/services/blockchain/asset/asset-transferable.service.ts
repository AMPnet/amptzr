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
  AssetTransferable,
  AssetTransferable__factory,
  AssetTransferableFactory,
  AssetTransferableFactory__factory,
} from '../../../../../../types/ethers-contracts'
import { BigNumber, BigNumberish, Signer } from 'ethers'
import { Provider } from '@ethersproject/providers'
import { findLog } from '../../../utils/ethersjs'

@Injectable({
  providedIn: 'root',
})
export class AssetTransferableService {
  factoryContract$: Observable<AssetTransferableFactory> =
    this.sessionQuery.provider$.pipe(
      map((provider) =>
        AssetTransferableFactory__factory.connect(
          this.preferenceQuery.network.tokenizerConfig.assetFactory
            .transferable,
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

  contract(
    address: string,
    signerOrProvider: Signer | Provider
  ): AssetTransferable {
    return AssetTransferable__factory.connect(address, signerOrProvider)
  }

  create(data: CreateTransferableAssetData): Observable<string | undefined> {
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
              apxRegistry:
                this.preferenceQuery.network.tokenizerConfig.apxRegistry,
              nameRegistry:
                this.preferenceQuery.network.tokenizerConfig.nameRegistry,
              mappedName: data.slug,
              initialTokenSupply: data.initialTokenSupply,
              whitelistRequiredForRevenueClaim:
                data.whitelistRequiredForRevenueClaim,
              whitelistRequiredForLiquidationClaim:
                data.whitelistRequiredForLiquidationClaim,
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
                contract.interface.getEvent('AssetTransferableCreated')
              )?.args?.asset
          )
        )
      })
    )
  }

  getState(
    address: string,
    signerOrProvider: Signer | Provider
  ): Observable<TransferableAssetState> {
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

interface CreateTransferableAssetData {
  issuer: string
  slug: string
  initialTokenSupply: BigNumberish
  whitelistRequiredForRevenueClaim: boolean
  whitelistRequiredForLiquidationClaim: boolean
  name: string
  symbol: string
  info: string
}

export interface TransferableAssetState {
  flavor: string
  version: string
  contractAddress: string
  owner: string
  initialTokenSupply: BigNumber
  whitelistRequiredForRevenueClaim: boolean
  whitelistRequiredForLiquidationClaim: boolean
  assetApprovedByIssuer: boolean
  issuer: string
  apxRegistry: string
  info: string
  name: string
  symbol: string
  totalAmountRaised: BigNumber
  totalTokensSold: BigNumber
  highestTokenSellPrice: BigNumber
  liquidated: boolean
  liquidationFundsTotal: BigNumber
  liquidationTimestamp: BigNumber
  liquidationFundsClaimed: BigNumber
}
