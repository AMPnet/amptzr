import { ChangeDetectionStrategy, Component } from '@angular/core'
import { PreferenceQuery } from '../preference/state/preference.query'
import { combineLatest, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'
import {
  StablecoinConfig,
  StablecoinService,
} from '../shared/services/blockchain/stablecoin.service'
import { Network, Networks } from '../shared/networks'

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositComponent {
  state$: Observable<State> = combineLatest([
    this.preferenceQuery.network$,
    of(this.stablecoin.config),
    this.preferenceQuery.issuer$,
  ]).pipe(map(([network, stablecoin]) => ({ network, stablecoin })))

  nativeCurrency = Networks[this.preferenceQuery.getValue().chainID].nativeCurrency

  constructor(
    public preferenceQuery: PreferenceQuery,
    public stablecoin: StablecoinService,
  ) {}
}

interface State {
  network: Network
  stablecoin: StablecoinConfig
}
