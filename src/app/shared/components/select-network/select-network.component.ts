import {ChangeDetectionStrategy, Component} from '@angular/core'
import {ChainID, Networks} from '../../networks'
import {environment} from '../../../../environments/environment'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {PreferenceStore} from '../../../preference/state/preference.store'

/**
 * Only this component should be used for changing the networks.
 */
@Component({
  selector: 'app-select-network',
  templateUrl: './select-network.component.html',
  styleUrls: ['./select-network.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectNetworkComponent {
  networks = Object.values(Networks)
  currentNetwork = Networks[this.preferenceQuery.getValue().chainID]
  isNetworkFixed = !!environment.fixed.chainID

  constructor(private preferenceStore: PreferenceStore,
              private preferenceQuery: PreferenceQuery) {
  }

  networkChanged(e: Event): void {
    const chainID = Number((e.target as HTMLSelectElement).value) as ChainID
    this.currentNetwork = Networks[chainID]
    this.preferenceStore.update({chainID})
  }
}
