import { Injectable } from '@angular/core'
import { combineLatest, from, Observable, of } from 'rxjs'
import { first, map, switchMap } from 'rxjs/operators'
import { BigNumber, BigNumberish, Signer } from 'ethers'
import { Provider } from '@ethersproject/providers'
import {
  Asset,
  Asset__factory,
  AssetFactory,
  AssetFactory__factory,
} from '../../../../../../types/ethers-contracts'
import { SessionQuery } from '../../../../session/state/session.query'
import { PreferenceQuery } from '../../../../preference/state/preference.query'
import { findLog } from '../../../utils/ethersjs'
import { SignerService } from '../../signer.service'
import { GasService } from '../gas.service'
import { DialogService } from '../../dialog.service'
import { ErrorService } from '../../error.service'

@Injectable({
  providedIn: 'root',
})
export class AssetBasicService {
  factoryContract$: Observable<AssetFactory> = this.sessionQuery.provider$.pipe(
    map((provider) =>
      AssetFactory__factory.connect(
        this.preferenceQuery.network.tokenizerConfig.assetFactory.basic,
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

  contract(address: string, signerOrProvider: Signer | Provider): Asset {
    return Asset__factory.connect(address, signerOrProvider)
  }

  create(data: CreateBasicAssetData): Observable<string | undefined> {
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
        return from(
          contract.populateTransaction.create(
            {
              creator: this.preferenceQuery.getValue().address!,
              issuer: data.issuer,
              apxRegistry:
                this.preferenceQuery.network.tokenizerConfig.apxRegistry,
              nameRegistry:
                this.preferenceQuery.network.tokenizerConfig.nameRegistry,
              mappedName: data.slug,
              initialTokenSupply: data.initialTokenSupply,
              transferable: false,
              whitelistRequiredForRevenueClaim:
                data.whitelistRequiredForLiquidationClaim,
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
                contract.interface.getEvent('AssetCreated')
              )?.args?.asset
          )
        )
      })
    )
  }

  getState(
    address: string,
    signerOrProvider: Signer | Provider
  ): Observable<AssetState> {
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

interface CreateBasicAssetData {
  issuer: string
  slug: string
  initialTokenSupply: BigNumberish
  whitelistRequiredForRevenueClaim: boolean
  whitelistRequiredForLiquidationClaim: boolean
  name: string
  symbol: string
  info: string
}

export interface AssetState {
  flavor: string
  version: string
  contractAddress: string
  owner: string
  initialTokenSupply: BigNumber
  transferable: boolean
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
  totalTokensLocked: BigNumber
  totalTokensLockedAndLiquidated: BigNumber
  liquidated: boolean
  liquidationFundsTotal: BigNumber
  liquidationTimestamp: BigNumber
  liquidationFundsClaimed: BigNumber
}
