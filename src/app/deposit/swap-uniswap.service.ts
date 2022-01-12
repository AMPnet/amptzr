import {Injectable} from '@angular/core'
import {combineLatest, Observable} from 'rxjs'
import {SessionQuery} from '../session/state/session.query'
import {ToUrlIPFSPipe} from '../shared/pipes/to-url-ipfs.pipe'
import {PreferenceQuery} from '../preference/state/preference.query'
import {filter, map} from 'rxjs/operators'
import {IssuerService} from '../shared/services/blockchain/issuer/issuer.service'
import {StablecoinBigNumber, StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {ConversionService} from '../shared/services/conversion.service'
import {MaticNetwork, Network} from '../shared/networks'
import {MetamaskSubsignerService} from '../shared/services/subsigners/metamask-subsigner.service'
import {AuthProvider} from '../preference/state/preference.store'
import {SignerService} from '../shared/services/signer.service'

@Injectable({
  providedIn: 'root',
})
export class SwapUniswapService {
  isAvailable$: Observable<boolean>

  constructor(private sessionQuery: SessionQuery,
              private signer: SignerService,
              private issuerService: IssuerService,
              private toUrlIpfsPipe: ToUrlIPFSPipe,
              private stablecoinService: StablecoinService,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private conversion: ConversionService,
              private preferenceQuery: PreferenceQuery) {
    const isConnectedWithMetamask$: Observable<boolean> = combineLatest([
      this.signer.injectedWeb3$,
      this.sessionQuery.authProvider$,
    ]).pipe(
      map(([ethereum, authProvider]) =>
        !!ethereum.isMetaMask && authProvider === AuthProvider.METAMASK,
      ),
    )

    this.isAvailable$ = combineLatest([
      isConnectedWithMetamask$,
      this.preferenceQuery.network$,
    ]).pipe(
      map(([isMetamask, network]) => isMetamask && this.isNetworkSupported(network)),
    )
  }

  private isNetworkSupported(network: Network): boolean {
    const supportedNetworks = [MaticNetwork]

    return supportedNetworks
      .map(net => net.chainID)
      .includes(network.chainID)
  }

  getLink(swapAmount: StablecoinBigNumber): Observable<string> {
    return combineLatest([
      this.issuerService.issuer$,
      this.isAvailable$,
    ]).pipe(
      filter(([_issuer, isAvailable]) => isAvailable),
      map(([issuer]) => {
        const stablecoinAddress = issuer.stablecoin
        const amount = this.conversion.parseStablecoin(swapAmount)

        return `https://app.uniswap.org/#/swap?exactField=output&exactAmount=${amount}&outputCurrency=${stablecoinAddress}`
      }),
    )
  }
}
