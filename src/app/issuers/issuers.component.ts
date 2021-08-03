import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {IssuerService, IssuerState, IssuerWithInfo} from '../shared/services/blockchain/issuer.service'
import {Observable} from 'rxjs'
import {WithStatus} from '../shared/utils/observables'
import {SessionQuery} from '../session/state/session.query'
import {tap} from 'rxjs/operators'

@Component({
  selector: 'app-issuers',
  templateUrl: './issuers.component.html',
  styleUrls: ['./issuers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuersComponent {
  issuers$: Observable<WithStatus<IssuerWithInfo[]>> = this.issuerService.issuers$
  address$ = this.sessionQuery.address$.pipe(
    tap(() => ɵmarkDirty(this)),
  )

  constructor(private issuerService: IssuerService,
              private sessionQuery: SessionQuery) {
  }
}
