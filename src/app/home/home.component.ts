import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../shared/utils/observables'
import {IssuerService, IssuerWithInfo} from '../shared/services/blockchain/issuer.service'
import {switchMap} from 'rxjs/operators'
import {RouterService} from '../shared/services/router.service'
import {SessionQuery} from '../session/state/session.query'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  issuers$: Observable<WithStatus<IssuerWithInfo[]>> = this.sessionQuery.provider$.pipe(
    switchMap(() => withStatus(this.issuerService.issuers$)),
  )

  constructor(private issuerService: IssuerService,
              private router: RouterService,
              private sessionQuery: SessionQuery) {
  }

  openIssuer(issuer: IssuerWithInfo) {
    this.router.navigateIssuer(issuer.ansName)
  }
}
