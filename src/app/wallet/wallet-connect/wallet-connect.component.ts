import {ChangeDetectionStrategy, Component} from '@angular/core'
import {EMPTY, Observable} from 'rxjs'
import {SignerService} from '../../shared/services/signer.service'
import {ChainID, Networks} from '../../shared/networks'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {PreferenceStore} from '../../preference/state/preference.store'

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletConnectComponent {
  networks = Object.values(Networks);
  currentNetwork = Networks[this.preferenceQuery.getValue().chainID];

  constructor(private signer: SignerService,
              private preferenceStore: PreferenceStore,
              private preferenceQuery: PreferenceQuery) {
  }

  connectMetamask(): Observable<unknown> {
    return this.signer.login()
  }

  connectWalletConnect(): Observable<unknown> {
    return EMPTY
  }

  networkChanged(e: Event): void {
    const chainID = Number((e.target as HTMLSelectElement).value) as ChainID
    this.currentNetwork = Networks[chainID]
    this.preferenceStore.update({chainID})
  }
}
