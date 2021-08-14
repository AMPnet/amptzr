import {ChangeDetectionStrategy, Component} from '@angular/core'
import {ChainID, EthersNetworks} from '../../networks'
import {environment} from '../../../../environments/environment'
import {PreferenceStore} from '../../../preference/state/preference.store'
import {PreferenceQuery} from '../../../preference/state/preference.query'

@Component({
  selector: 'app-select-network',
  templateUrl: './select-network.component.html',
  styleUrls: ['./select-network.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectNetworkComponent {
  networks = Object.values(EthersNetworks)
  currentNetwork = EthersNetworks[this.preferenceQuery.getValue().chainID]
  isNetworkFixed = !!environment.fixed.chainID

  constructor(private preferenceStore: PreferenceStore,
              private preferenceQuery: PreferenceQuery) {
  }

  networkChanged(e: Event): void {
    const chainID = Number((e.target as HTMLSelectElement).value) as ChainID
    this.currentNetwork = EthersNetworks[chainID]
    this.preferenceStore.update({chainID})
  }
}
