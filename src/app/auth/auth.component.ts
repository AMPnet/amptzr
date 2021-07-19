import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PreferenceQuery } from '../preference/state/preference.query';
import { PreferenceStore } from '../preference/state/preference.store';
import { SessionQuery } from '../session/state/session.query';
import { ChainID, EthersNetworks } from '../shared/networks';
import { SignerService } from '../shared/services/signer.service';
import { MetamaskSubsignerService } from '../shared/services/subsigners/metamask-subsigner.service';
import { VenlySubsignerService } from '../shared/services/subsigners/venly-subsigner.service';
import { WalletConnectSubsignerService } from '../shared/services/subsigners/walletconnect-subsigner.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent implements OnInit {

  networks = Object.values(EthersNetworks)
  currentNetwork = EthersNetworks[this.preferenceQuery.getValue().chainID]

  constructor(private signer: SignerService,
              private preferenceStore: PreferenceStore,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private walletConnectSubsignerService: WalletConnectSubsignerService,
              private venlySubsignerService: VenlySubsignerService,
              private preferenceQuery: PreferenceQuery,
              private sessionQuery: SessionQuery,
              private router: Router) {
}

  ngOnInit(): void {
    this.signer.logout() // Prune state
    this.handleLogin() 
  }

  handleLogin() {
    this.sessionQuery
      .isLoggedIn$
      .subscribe(isLoggedIn => {
      if(isLoggedIn) { this.router.navigate(["/"]) } // Navigate to "root" after finishing auth
    })
  }

  connectMetamask(): Observable<unknown> {
    return this.signer.login(this.metamaskSubsignerService)
  }

  connectWalletConnect(): Observable<unknown> {
    return this.signer.login(this.walletConnectSubsignerService)
  }

  connectVenly(): Observable<unknown> {
    return this.signer.login(this.venlySubsignerService)
  }

  networkChanged(e: Event): void {
    const chainID = Number((e.target as HTMLSelectElement).value) as ChainID
    this.currentNetwork = EthersNetworks[chainID]
    this.preferenceStore.update({chainID})
  }

  isMetamaskAvailable = () => this.metamaskSubsignerService.isAvailable()

}
