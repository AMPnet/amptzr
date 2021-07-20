import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { PreferenceQuery } from '../preference/state/preference.query'
import { PreferenceStore } from '../preference/state/preference.store'
import { SessionQuery } from '../session/state/session.query'
import { ChainID, EthersNetworks } from '../shared/networks'
import { SignerService } from '../shared/services/signer.service'
import { MetamaskSubsignerService } from '../shared/services/subsigners/metamask-subsigner.service'
import { VenlySubsignerService } from '../shared/services/subsigners/venly-subsigner.service'
import { WalletConnectSubsignerService } from '../shared/services/subsigners/walletconnect-subsigner.service'

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent {
  networks = Object.values(EthersNetworks)
  currentNetwork = EthersNetworks[this.preferenceQuery.getValue().chainID]

  constructor(private signer: SignerService,
              private preferenceStore: PreferenceStore,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private walletConnectSubsignerService: WalletConnectSubsignerService,
              private venlySubsignerService: VenlySubsignerService,
              private preferenceQuery: PreferenceQuery,
              private router: Router) {
}

  afterLoginActions() {
    this.router.navigate(['/'])
  }

  connectMetamask(): Observable<unknown> {
    return this.signer.login(this.metamaskSubsignerService).pipe(
      tap(() => this.afterLoginActions())
    )
  }

  connectVenly(): Observable<unknown> {
    return this.signer.login(this.venlySubsignerService).pipe(
      tap(() => this.afterLoginActions())
    )
  }

  networkChanged(e: Event): void {
    const chainID = Number((e.target as HTMLSelectElement).value) as ChainID
    this.currentNetwork = EthersNetworks[chainID]
    this.preferenceStore.update({chainID})
  }

  isMetamaskAvailable = () => this.metamaskSubsignerService.isAvailable()
}
