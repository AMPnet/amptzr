import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {PreferenceQuery} from '../../../preference/state/preference.query'

@Component({
  selector: 'app-explorer-link',
  templateUrl: './explorer-link.component.html',
  styleUrls: ['./explorer-link.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerLinkComponent {
  @Input() value = ''
  @Input() type: ExplorerLinkType = 'address'

  constructor(private preferenceQuery: PreferenceQuery) {
  }

  get link(): string {
    const explorerURL = this.preferenceQuery.network.explorerURLs?.[0]
    if (!explorerURL || !this.value) return ''

    return `${explorerURL}${this.type}/${this.value}`
  }
}

type ExplorerLinkType = 'tx' | 'address' | 'token'
