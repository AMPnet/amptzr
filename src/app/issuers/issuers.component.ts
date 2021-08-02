import {ChangeDetectionStrategy, Component} from '@angular/core'
import {combineLatest, from} from 'rxjs'
import {Issuer__factory, IssuerFactory__factory} from '../../../types/ethers-contracts'
import {SessionQuery} from '../session/state/session.query'
import {map, switchMap, tap} from 'rxjs/operators'
import {PreferenceQuery} from '../preference/state/preference.query'
import {Networks} from '../shared/networks'
import {withStatus} from '../shared/utils/observables'

@Component({
  selector: 'app-issuers',
  templateUrl: './issuers.component.html',
  styleUrls: ['./issuers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuersComponent {
  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery) {
  }

  issuers$ = combineLatest([
    this.sessionQuery.provider$,
    this.preferenceQuery.select('chainID'),
  ]).pipe(
    map(([provider, chainID]) =>
      IssuerFactory__factory.connect(Networks[chainID].factoryConfig.issuer, provider),
    ),
    switchMap(issuerFactory => withStatus(from(issuerFactory.getInstances()))),
  )

  issuer$ = combineLatest([
    this.sessionQuery.provider$,
    this.preferenceQuery.select('chainID'),
  ]).pipe(
    map(([provider, chainID]) =>
      Issuer__factory.connect('0x753521D4B6eB57B4CF1EF3e56f9Ff49402f4aFcD', provider),
    ),
    switchMap(issuer => from(issuer.registry())),
  )


  // getIssuer(address: string, provider: Provider) {
  //   return of(Issuer__factory.connect(address, provider)).pipe(
  //     map(issuer =>),
  //   )IIssuer__factory.connect(issuers[0], issuerFactory.provider).functions.stablecoin()
  // }
}
