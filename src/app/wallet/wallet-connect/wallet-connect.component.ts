import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {SignerService} from '../../shared/services/signer.service'
import {ChainID, EthersNetworks} from '../../shared/networks'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {PreferenceStore} from '../../preference/state/preference.store'
import {MetamaskSubsignerService} from '../../shared/services/subsigners/metamask-subsigner.service'
import {WalletConnectSubsignerService} from '../../shared/services/subsigners/walletconnect-subsigner.service'

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletConnectComponent {
  networks = Object.values(EthersNetworks)
  currentNetwork = EthersNetworks[this.preferenceQuery.getValue().chainID]

  constructor(private signer: SignerService,
              private preferenceStore: PreferenceStore,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private walletConnectSubsignerService: WalletConnectSubsignerService,
              private preferenceQuery: PreferenceQuery) {
  }

  connectMetamask(): Observable<unknown> {
    return this.signer.login(this.metamaskSubsignerService)
  }

  connectWalletConnect(): Observable<unknown> {
    return this.signer.login(this.walletConnectSubsignerService)
  }

  networkChanged(e: Event): void {
    const chainID = Number((e.target as HTMLSelectElement).value) as ChainID
    this.currentNetwork = EthersNetworks[chainID]
    this.preferenceStore.update({chainID})
  }
}
