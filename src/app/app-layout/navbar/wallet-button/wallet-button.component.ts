import {ChangeDetectionStrategy, Component} from '@angular/core'
import {AuthProvider} from 'src/app/preference/state/preference.store'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {WalletConnectSubsignerService} from '../../../shared/services/subsigners/walletconnect-subsigner.service'
import {MaticNetwork, MumbaiNetwork} from '../../../shared/networks'

@Component({
  selector: 'app-wallet-button',
  templateUrl: './wallet-button.component.html',
  styleUrls: ['./wallet-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletButtonComponent {
  network$ = this.preferenceQuery.network$
  address$ = this.preferenceQuery.address$
  authProvider$ = this.preferenceQuery.authProvider$
  AuthProvider = AuthProvider

  chainIds = {
    matic: MaticNetwork.chainID,
    mumbai: MumbaiNetwork.chainID,
  }

  constructor(private preferenceQuery: PreferenceQuery,
              public walletConnectSubsignerService: WalletConnectSubsignerService) {
  }
}
