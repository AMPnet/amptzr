import { Injectable } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { ToUrlIPFSPipe } from '../shared/pipes/to-url-ipfs.pipe'
import { PreferenceQuery } from '../preference/state/preference.query'
import { filter, map } from 'rxjs/operators'
import { IssuerService } from '../shared/services/blockchain/issuer/issuer.service'
import {
  StablecoinBigNumber,
  StablecoinService,
} from '../shared/services/blockchain/stablecoin.service'
import { ConversionService } from '../shared/services/conversion.service'
import { ChainID, Network } from '../shared/networks'
import { MetamaskSubsignerService } from '../shared/services/subsigners/metamask-subsigner.service'
import { AuthProvider } from '../preference/state/preference.store'
import { SignerService } from '../shared/services/signer.service'

@Injectable({
  providedIn: 'root',
})
export class SwapUniswapService {
  isAvailable$: Observable<boolean>

  // chainIdToName mapping needs to be in sync with uniswap mappings
  // source: https://github.com/Uniswap/interface/blob/3153db9f73e1e9b1dcf1b74bb7d5059176162172/src/constants/chains.ts#L21-L33
  chainIdToName: { [key in ChainID]: string } = {
    [ChainID.MATIC_MAINNET]: 'polygon',
    [ChainID.MUMBAI_TESTNET]: 'polygon_mumbai',
    [ChainID.GOERLI_TESTNET]: 'goerli',
    [ChainID.AURORA_MAINNET]: 'aurora',
    [ChainID.OPTIMISM]: 'optimism',
    [ChainID.ARBITRUM]: 'arbitrum',
    [ChainID.AVALANCHE]: 'avalanche'
  }

  constructor(
    private signer: SignerService,
    private issuerService: IssuerService,
    private toUrlIpfsPipe: ToUrlIPFSPipe,
    private stablecoinService: StablecoinService,
    private metamaskSubsignerService: MetamaskSubsignerService,
    private conversion: ConversionService,
    private preferenceQuery: PreferenceQuery
  ) {
    const isConnectedWithMetamask$: Observable<boolean> = combineLatest([
      this.signer.injectedWeb3$,
      this.preferenceQuery.authProvider$,
    ]).pipe(
      map(
        ([ethereum, authProvider]) =>
          !!ethereum.isMetaMask && authProvider === AuthProvider.METAMASK
      )
    )

    this.isAvailable$ = combineLatest([
      isConnectedWithMetamask$,
      this.preferenceQuery.network$,
    ]).pipe(
      map(
        ([isMetamask, network]) =>
          isMetamask && this.isNetworkSupported(network)
      )
    )
  }

  private isNetworkSupported(network: Network): boolean {
    return !!this.chainIdToName[network.chainID]
  }

  getLink(swapAmount: StablecoinBigNumber): Observable<string> {
    return combineLatest([this.issuerService.issuer$, this.isAvailable$]).pipe(
      filter(([_issuer, isAvailable]) => isAvailable),
      map(([issuer]) => {
        const stablecoinAddress = issuer.stablecoin
        const amount = this.conversion.parseStablecoin(swapAmount)

        const searchParams = new URLSearchParams({
          chain: this.chainIdToName[this.preferenceQuery.network.chainID] || '',
          exactField: 'output',
          exactAmount: amount,
          outputCurrency: stablecoinAddress,
        })

        return `https://app.uniswap.org/#/swap?${searchParams.toString()}`
      })
    )
  }
}
