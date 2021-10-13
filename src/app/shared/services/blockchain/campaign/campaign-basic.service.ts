import {Injectable} from '@angular/core'
import {combineLatest, from, Observable, of} from 'rxjs'
import {IpfsService} from '../../ipfs/ipfs.service'
import {PreferenceQuery} from '../../../../preference/state/preference.query'
import {StablecoinService} from '../stablecoin.service'
import {
  CfManagerSoftcap,
  CfManagerSoftcap__factory,
  CfManagerSoftcapFactory,
  CfManagerSoftcapFactory__factory,
} from '../../../../../../types/ethers-contracts'
import {GasService} from '../gas.service'
import {BigNumber, BigNumberish, Signer} from 'ethers'
import {first, map, switchMap, take} from 'rxjs/operators'
import {DialogService} from '../../dialog.service'
import {SignerService} from '../../signer.service'
import {SessionQuery} from '../../../../session/state/session.query'
import {findLog} from '../../../utils/ethersjs'
import {ErrorService} from '../../error.service'
import {TokenPrice} from '../../../utils/token-price'
import {Provider} from '@ethersproject/providers'
import {CampaignCommonState} from './campaign.common'
import {CampaignFlavor} from '../flavors'

@Injectable({
  providedIn: 'root',
})
export class CampaignBasicService {
  factoryContract$: Observable<CfManagerSoftcapFactory> = this.sessionQuery.provider$.pipe(
    map(provider => CfManagerSoftcapFactory__factory.connect(
      this.preferenceQuery.network.tokenizerConfig.cfManagerFactory.basic, provider,
    )),
  )

  constructor(private sessionQuery: SessionQuery,
              private ipfsService: IpfsService,
              private signerService: SignerService,
              private errorService: ErrorService,
              private dialogService: DialogService,
              private stablecoin: StablecoinService,
              private gasService: GasService,
              private preferenceQuery: PreferenceQuery) {
  }

  contract(address: string, signerOrProvider: Signer | Provider): CfManagerSoftcap {
    return CfManagerSoftcap__factory.connect(address, signerOrProvider)
  }

  getState(address: string): Observable<CampaignBasicState> {
    return this.sessionQuery.provider$.pipe(
      map(provider => this.contract(address, provider)),
      switchMap(contract => contract.getState()),
    )
  }

  getStateFromCommon(campaign: CampaignCommonState): Observable<CampaignBasicState | undefined> {
    return campaign.flavor === CampaignFlavor.BASIC ?
      this.getState(campaign.contractAddress) : of(undefined)
  }

  create(data: CreateBasicCampaignData): Observable<string | undefined> {
    return combineLatest([
      this.signerService.ensureAuth,
      this.factoryContract$,
    ]).pipe(
      first(),
      map(([signer, contract]) => contract.connect(signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => {
        const owner = this.sessionQuery.getValue().address!

        return from(contract.populateTransaction.create(
          owner, data.slug, data.assetAddress,
          data.initialPricePerToken, data.softCap,
          data.minInvestment, data.maxInvestment,
          data.whitelistRequired, data.info,
          this.preferenceQuery.network.tokenizerConfig.nameRegistry,
          overrides,
        )).pipe(
          switchMap(tx => this.signerService.sendTransaction(tx)),
          this.errorService.handleError(),
          switchMap(tx => this.dialogService.loading(
            from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
            'Processing transaction...',
          )),
          map(receipt => findLog(
            receipt, contract, contract.interface.getEvent('CfManagerSoftcapCreated'),
          )?.args?.cfManager),
        )
      }),
    )
  }

  invest(address: string, amount: number) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(address, signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.populateTransaction.invest(this.stablecoin.parse(amount), overrides)),
      switchMap(tx => this.signerService.sendTransaction(tx)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
      this.errorService.handleError(),
    )
  }

  stats(campaignAddress: string): Observable<BasicCampaignStats> {
    return this.getState(campaignAddress).pipe(
      map(campaign => {
        const userMin = this.stablecoin.format(campaign.minInvestment)
        const userMax = this.stablecoin.format(campaign.maxInvestment)
        const tokenBalance = this.stablecoin.format(campaign.totalTokensBalance, 18)
        const tokensSold = this.stablecoin.format(campaign.totalTokensSold, 18)
        const tokensClaimable = this.stablecoin.format(campaign.totalClaimableTokens, 18)
        const softCap = this.stablecoin.format(campaign.softCap)
        const tokensClaimed = tokensSold - tokensClaimable
        const tokenPrice = TokenPrice.parse(campaign.tokenPrice.toNumber())
        const tokensAvailable = Math.max(0, tokenBalance - tokensSold)

        const valueInvested = tokensSold * tokenPrice
        const valueTotal = Math.max(tokenBalance, tokensSold) * tokenPrice
        const valueToInvest = tokensAvailable * tokenPrice

        const tokenValue = campaign.totalTokensBalance
          .mul(campaign.tokenPrice)
          .mul(BigNumber.from((10 ** this.stablecoin.precision).toString()))
          .div(BigNumber.from((10 ** TokenPrice.precision).toString()))
          .div(BigNumber.from((10 ** 18).toString())) // token precision

        const softCapReached = tokenValue.gte(campaign.softCap)

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
      }),
    )
  }

  isWhitelistRequired(address: string): Observable<boolean> {
    return this.getState(address).pipe(take(1),
      map(state => state.whitelistRequired),
    )
  }

  cancelInvestment(address: string) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(address, signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.populateTransaction.cancelInvestment(overrides)),
      switchMap(tx => this.signerService.sendTransaction(tx)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
      this.errorService.handleError(),
    )
  }

  finalize(address: string) {
    return this.signerService.ensureAuth.pipe(
      map(signer => this.contract(address, signer)),
      switchMap(contract => combineLatest([of(contract), this.gasService.overrides])),
      switchMap(([contract, overrides]) => contract.populateTransaction.finalize(overrides)),
      switchMap(tx => this.signerService.sendTransaction(tx)),
      switchMap(tx => this.dialogService.loading(
        from(this.sessionQuery.provider.waitForTransaction(tx.hash)),
        'Processing transaction...',
      )),
      this.errorService.handleError(),
    )
  }
}

export interface CampaignBasicState {
  flavor: string;
  version: string;
  contractAddress: string;
  owner: string;
  asset: string;
  issuer: string;
  stablecoin: string;
  tokenPrice: BigNumber;
  softCap: BigNumber;
  minInvestment: BigNumber;
  maxInvestment: BigNumber;
  whitelistRequired: boolean;
  finalized: boolean;
  canceled: boolean;
  totalClaimableTokens: BigNumber;
  totalInvestorsCount: BigNumber;
  totalClaimsCount: BigNumber;
  totalFundsRaised: BigNumber;
  totalTokensSold: BigNumber;
  totalTokensBalance: BigNumber;
  info: string;
}

interface CreateBasicCampaignData {
  slug: string,
  assetAddress: string,
  initialPricePerToken: BigNumberish,
  softCap: BigNumberish,
  minInvestment: BigNumberish,
  maxInvestment: BigNumberish,
  whitelistRequired: boolean,
  info: string,
}

interface BasicCampaignStats {
  userMin: number
  userMax: number
  tokenBalance: number
  tokensSold: number
  tokensClaimed: number
  softCap: number
  tokenPrice: number
  tokensAvailable: number
  valueInvested: number
  valueTotal: number
  valueToInvest: number
  softCapReached: boolean
}
