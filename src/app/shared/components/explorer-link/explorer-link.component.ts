import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {PreferenceQuery} from '../../../preference/state/preference.query'

@Component({
  selector: 'app-explorer-link',
  templateUrl: './explorer-link.component.html',
  styleUrls: ['./explorer-link.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerLinkComponent implements OnInit {
  @Input() value = ''
  @Input() type: ExplorerLinkType = 'address'

  link = ''

  constructor(private preferenceQuery: PreferenceQuery) {
  }

  ngOnInit() {
    this.link = this.createLink()
  }

  createLink(): string {
    const explorerURL = this.preferenceQuery.network.explorerURLs?.[0]
    if (!explorerURL || !this.value) {
      return ''
    }


    return `${explorerURL}${this.type}/${this.value}`
  }
}

type ExplorerLinkType = 'tx' | 'address' | 'token'
