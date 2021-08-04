import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {map, tap} from 'rxjs/operators'
import {SessionQuery} from '../../session/state/session.query'

@Component({
  selector: 'app-issuer-list',
  templateUrl: './issuer-list.component.html',
  styleUrls: ['./issuer-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuerListComponent {
  issuers$: Observable<WithStatus<IssuerWithInfo[]>> = withStatus(this.issuerService.issuers$)
  address$ = this.sessionQuery.address$.pipe(
    map(value => ({value: value})),
    tap(() => ɵmarkDirty(this)),
  )

  constructor(private issuerService: IssuerService,
              private sessionQuery: SessionQuery) {
  }
}
