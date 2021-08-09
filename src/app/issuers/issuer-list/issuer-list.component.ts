import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {map, switchMap, tap} from 'rxjs/operators'
import {SessionQuery} from '../../session/state/session.query'
import {ChainID, EthersNetworks} from '../../shared/networks'
import {PreferenceStore} from '../../preference/state/preference.store'
import {PreferenceQuery} from '../../preference/state/preference.query'

@Component({
  selector: 'app-issuer-list',
  templateUrl: './issuer-list.component.html',
  styleUrls: ['./issuer-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuerListComponent {
  networks = Object.values(EthersNetworks)
  currentNetwork = EthersNetworks[this.preferenceQuery.getValue().chainID]

  issuers$: Observable<WithStatus<IssuerWithInfo[]>> = this.sessionQuery.provider$.pipe(
    switchMap(() => withStatus(this.issuerService.issuers$)),
  )

  address$ = this.sessionQuery.address$.pipe(
    map(value => ({value: value})),
    tap(() => ɵmarkDirty(this)),
  )

  constructor(private issuerService: IssuerService,
              private preferenceStore: PreferenceStore,
              private preferenceQuery: PreferenceQuery,
              private sessionQuery: SessionQuery) {
  }

  networkChanged(e: Event): void {
    const chainID = Number((e.target as HTMLSelectElement).value) as ChainID
    this.currentNetwork = EthersNetworks[chainID]
    this.preferenceStore.update({chainID})
  }
}
