import { ChangeDetectionStrategy, Component, Optional } from '@angular/core'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { SessionQuery } from '../../../session/state/session.query'
import { combineLatest, from, Observable, of, switchMap, tap } from 'rxjs'
import { catchError, map, startWith, timeout } from 'rxjs/operators'
import { SignerService } from '../../services/signer.service'
import { UserService } from '../../services/user.service'
import { ChainID, Network, Networks } from '../../networks'
import { MetamaskSubsignerService } from '../../services/subsigners/metamask-subsigner.service'
import { AuthProvider } from '../../../preference/state/preference.store'
import { MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'app-wrong-network',
  templateUrl: './wrong-network.component.html',
  styleUrls: ['./wrong-network.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrongNetworkComponent {
  dismissDialog$ = this.signerService.networkMismatch$.pipe(
    tap((isMismatch) => {
      if (!isMismatch) this.dialogRef.close(true)
    })
  )

  currentNetwork$: Observable<Partial<Network> | undefined> = combineLatest([
    this.signerService.chainChanged$.pipe(startWith('')),
    of(this.sessionQuery.signer!),
  ]).pipe(
    switchMap(([_, signer]) =>
      from(signer.getChainId()).pipe(
        timeout(2000),
        map(
          (chainId) =>
            Networks[chainId as ChainID] || ({ chainID: chainId } as Network)
        ),
        catchError(() => of(undefined))
      )
    )
  )

  requestedNetwork$ = this.preferenceQuery.network$

  isConnectedWithMetamask$: Observable<boolean> = combineLatest([
    this.signerService.injectedWeb3$,
    this.preferenceQuery.authProvider$,
  ]).pipe(
    map(
      ([ethereum, authProvider]) =>
        !!ethereum.isMetaMask && authProvider === AuthProvider.METAMASK
    )
  )

  constructor(
    private preferenceQuery: PreferenceQuery,
    private sessionQuery: SessionQuery,
    private userService: UserService,
    private metamaskSubsignerService: MetamaskSubsignerService,
    private signerService: SignerService,
    @Optional() private dialogRef: MatDialogRef<WrongNetworkComponent>
  ) {}

  logout() {
    this.userService
      .logout()
      .pipe(tap(() => this.dialogRef.close(false)))
      .subscribe()
  }

  changeNetwork() {
    this.metamaskSubsignerService.switchEthereumChain().subscribe()
  }
}
