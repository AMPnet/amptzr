import { Injectable } from '@angular/core'
import { combineLatest, from, Observable, of } from 'rxjs'
import { IpfsService } from '../../ipfs/ipfs.service'
import { PreferenceQuery } from '../../../../preference/state/preference.query'
import { StablecoinBigNumber, StablecoinService } from '../stablecoin.service'
import {
  CfManagerSoftcap,
  CfManagerSoftcap__factory,
  CfManagerSoftcapFactory,
  CfManagerSoftcapFactory__factory,
} from '../../../../../../types/ethers-contracts'
import { GasService } from '../gas.service'
import { BigNumber, BigNumberish, constants, Signer } from 'ethers'
import { first, map, switchMap, take } from 'rxjs/operators'
import { DialogService } from '../../dialog.service'
import { SignerService } from '../../signer.service'
import { SessionQuery } from '../../../../session/state/session.query'
import { BigNumberMax, findLog } from '../../../utils/ethersjs'
import { ErrorService } from '../../error.service'
import { TokenPriceBigNumber } from '../../../utils/token-price'
import { Provider } from '@ethersproject/providers'
import { CampaignCommonState } from './campaign.common'
import { CampaignFlavor } from '../flavors'
import { TokenBigNumber } from '../../../utils/token'
import { ConversionService } from '../../conversion.service'

@Injectable({
  providedIn: 'root',
})
export class CampaignBasicService {
  factoryContract$: Observable<CfManagerSoftcapFactory> =
    this.sessionQuery.provider$.pipe(
      map((provider) =>
        CfManagerSoftcapFactory__factory.connect(
          this.preferenceQuery.network.tokenizerConfig.cfManagerFactory.basic,
          provider
        )
      )
    )

  constructor(
    private sessionQuery: SessionQuery,
    private ipfsService: IpfsService,
    private signerService: SignerService,
    private errorService: ErrorService,
    private dialogService: DialogService,
    private stablecoin: StablecoinService,
    private conversion: ConversionService,
    private gasService: GasService,
    private preferenceQuery: PreferenceQuery
  ) {}

  contract(
    address: string,
    signerOrProvider: Signer | Provider
  ): CfManagerSoftcap {
    return CfManagerSoftcap__factory.connect(address, signerOrProvider)
  }

  getState(address: string): Observable<CampaignBasicState> {
    return this.sessionQuery.provider$.pipe(
      map((provider) => this.contract(address, provider)),
      switchMap((contract) => contract.getState())
    )
  }

  getStateFromCommon(
    campaign: CampaignCommonState
  ): Observable<CampaignBasicState | undefined> {
    return campaign.flavor === CampaignFlavor.BASIC
      ? this.getState(campaign.contractAddress)
      : of(undefined)
  }

  create(data: CreateBasicCampaignData): Observable<string | undefined> {
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
        const owner = this.preferenceQuery.getValue().address!

        return from(
          contract.populateTransaction.create(
            owner,
            data.slug,
            data.assetAddress,
            data.initialPricePerToken,
            data.softCap,
            data.minInvestment,
            data.maxInvestment,
            data.whitelistRequired,
            data.info,
            this.preferenceQuery.network.tokenizerConfig.nameRegistry,
            this.preferenceQuery.network.tokenizerConfig.campaignFeeManager,
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
                contract.interface.getEvent('CfManagerSoftcapCreated')
              )?.args?.cfManager
          )
        )
      })
    )
  }

  invest(address: string, amount: StablecoinBigNumber) {
    return this.signerService.ensureAuth.pipe(
      switchMap((signer) =>
        this.dialogService.waitingApproval(
          of(this.contract(address, signer)).pipe(
            switchMap((contract) =>
              combineLatest([of(contract), this.gasService.overrides])
            ),
            switchMap(([contract, overrides]) =>
              contract.populateTransaction.invest(amount, overrides)
            ),
            switchMap((tx) => this.signerService.sendTransaction(tx))
          )
        )
      ),
      switchMap((tx) =>
        this.dialogService.waitingTransaction(
          from(this.sessionQuery.provider.waitForTransaction(tx.hash))
        )
      ),
      this.errorService.handleError(false, true)
    )
  }

  stats(campaignAddress: string): Observable<BasicCampaignStats> {
    return this.getState(campaignAddress).pipe(
      map((campaign) => {
        const userMin = campaign.minInvestment
        const userMax = campaign.maxInvestment
        const tokenBalance = campaign.totalTokensBalance
        const tokensSold = campaign.totalTokensSold
        const tokensClaimable = campaign.totalClaimableTokens
        const softCap = campaign.softCap
        const tokensClaimed = tokensSold.sub(tokensClaimable)
        const tokenPrice = campaign.tokenPrice
        const tokensAvailable = BigNumberMax(
          constants.Zero,
          tokenBalance.sub(tokensSold)
        )

        const valueInvested = this.conversion.calcStablecoin(
          tokensSold,
          tokenPrice
        )
        const valueTotal = this.conversion.calcStablecoin(
          tokenBalance,
          tokenPrice
        )
        const valueToInvest = this.conversion.calcStablecoin(
          tokensAvailable,
          tokenPrice
        )

        const softCapReached = valueTotal.gte(campaign.softCap)

        return {
          userMin,
          userMax,
          tokenBalance,
          tokensSold,
          tokensClaimed,
          softCap,
          tokenPrice,
          tokensAvailable,
          valueInvested,
          valueTotal,
          valueToInvest,
          softCapReached,
        }
      })
    )
  }

  isWhitelistRequired(address: string): Observable<boolean> {
    return this.getState(address).pipe(
      take(1),
      map((state) => state.whitelistRequired)
    )
  }

  cancelInvestment(address: string) {
    return this.signerService.ensureAuth.pipe(
      map((signer) => this.contract(address, signer)),
      switchMap((contract) =>
        this.dialogService.waitingApproval(
          combineLatest([of(contract), this.gasService.overrides]).pipe(
            switchMap(([contract, overrides]) =>
              contract.populateTransaction.cancelInvestment(overrides)
            ),
            switchMap((tx) => this.signerService.sendTransaction(tx))
          )
        )
      ),
      switchMap((tx) =>
        this.dialogService.waitingTransaction(
          from(this.sessionQuery.provider.waitForTransaction(tx.hash))
        )
      ),
      this.errorService.handleError()
    )
  }

  finalize(address: string) {
    return this.signerService.ensureAuth.pipe(
      map((signer) => this.contract(address, signer)),
      switchMap((contract) =>
        combineLatest([of(contract), this.gasService.overrides])
      ),
      switchMap(([contract, overrides]) =>
        contract.populateTransaction.finalize(overrides)
      ),
      switchMap((tx) => this.signerService.sendTransaction(tx)),
      switchMap((tx) =>
        this.dialogService.loading(
          from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
          'Processing transaction...'
        )
      ),
      this.errorService.handleError()
    )
  }

  changeOwner(campaignAddress: string, ownerAddress: string) {
    return this.signerService.ensureAuth.pipe(
      map((signer) => this.contract(campaignAddress, signer)),
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

export interface CampaignBasicState {
  flavor: string
  version: string
  contractAddress: string
  owner: string
  asset: string
  issuer: string
  stablecoin: string
  tokenPrice: BigNumber
  softCap: BigNumber
  minInvestment: BigNumber
  maxInvestment: BigNumber
  whitelistRequired: boolean
  finalized: boolean
  canceled: boolean
  totalClaimableTokens: BigNumber
  totalInvestorsCount: BigNumber
  totalClaimsCount: BigNumber
  totalFundsRaised: BigNumber
  totalTokensSold: BigNumber
  totalTokensBalance: BigNumber
  info: string
}

interface CreateBasicCampaignData {
  slug: string
  assetAddress: string
  initialPricePerToken: BigNumberish
  softCap: BigNumberish
  minInvestment: BigNumberish
  maxInvestment: BigNumberish
  whitelistRequired: boolean
  info: string
}

interface BasicCampaignStats {
  userMin: StablecoinBigNumber
  userMax: StablecoinBigNumber
  tokenBalance: TokenBigNumber
  tokensSold: TokenBigNumber
  tokensClaimed: TokenBigNumber
  softCap: StablecoinBigNumber
  tokenPrice: TokenPriceBigNumber
  tokensAvailable: TokenBigNumber
  valueInvested: StablecoinBigNumber
  valueTotal: StablecoinBigNumber
  valueToInvest: StablecoinBigNumber
  softCapReached: boolean
}
