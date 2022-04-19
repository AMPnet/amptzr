import {ChangeDetectionStrategy, Component} from '@angular/core'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {SessionQuery} from '../../../session/state/session.query'
import {combineLatest, defer, from, Observable, of, switchMap} from 'rxjs'
import {map, startWith} from 'rxjs/operators'
import {SignerService} from '../../services/signer.service'
import {UserService} from '../../services/user.service'
import {ChainID, Network, Networks} from '../../networks'
import {MetamaskSubsignerService} from '../../services/subsigners/metamask-subsigner.service'
import {AuthProvider} from '../../../preference/state/preference.store'

@Component({
  selector: 'app-wrong-network',
  templateUrl: './wrong-network.component.html',
  styleUrls: ['./wrong-network.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrongNetworkComponent {
  networkMismatch$: Observable<boolean> = combineLatest([
    this.preferenceQuery.network$,
    this.sessionQuery.isLoggedIn$,
    this.signerService.chainChanged$.pipe(startWith('')),
  ]).pipe(
    switchMap(([network, isLoggedIn]) => {
      if (!isLoggedIn || !this.sessionQuery.signer) return of(false)

      return from(this.sessionQuery.signer.getChainId()).pipe(
        map(chainID => chainID !== network.chainID),
      )
    }),
  )

  currentNetwork$: Observable<Partial<Network>> = defer(() => of(this.sessionQuery.signer!)).pipe(
    switchMap(signer => signer.getChainId()),
    map(chainId => Networks[chainId as ChainID] || {chainID: chainId} as Network),
  )

  requestedNetwork$ = this.preferenceQuery.network$

  isConnectedWithMetamask$: Observable<boolean> = combineLatest([
    this.signerService.injectedWeb3$,
    this.preferenceQuery.authProvider$,
  ]).pipe(
    map(([ethereum, authProvider]) =>
      !!ethereum.isMetaMask && authProvider === AuthProvider.METAMASK,
    ),
  )

  constructor(private preferenceQuery: PreferenceQuery,
              private sessionQuery: SessionQuery,
              private userService: UserService,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private signerService: SignerService) {
  }

  logout() {
    this.userService.logout().subscribe()
  }

  changeNetwork() {
    this.metamaskSubsignerService.switchEthereumChain({}).subscribe()
  }
}
