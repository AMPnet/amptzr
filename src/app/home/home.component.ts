import {ChangeDetectionStrategy, Component} from '@angular/core'
import {combineLatest, Observable, of} from 'rxjs'
import {WithStatus, withStatus} from '../shared/utils/observables'
import {map, switchMap} from 'rxjs/operators'
import {RouterService} from '../shared/services/router.service'
import {IssuerService, IssuerWithInfo} from '../shared/services/blockchain/issuer/issuer.service'
import {QueryService} from '../shared/services/blockchain/query.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  issuers$: Observable<WithStatus<IssuerItem[]>> = this.queryService.issuers$.pipe(
    switchMap(issuers => withStatus(
        issuers.length === 0 ? of([]) : combineLatest(
          issuers.map(issuer => this.issuerService.getIssuerInfo(issuer.issuer).pipe(
            map(i => ({mappedName: issuer.mappedName, issuer: i})),
          ))),
      ),
    ),
  )

  constructor(private issuerService: IssuerService,
              private router: RouterService,
              private queryService: QueryService) {
  }

  openIssuer(issuer: IssuerItem) {
    this.router.navigateIssuer(issuer.mappedName || issuer.issuer.contractAddress)
  }
}

interface IssuerItem {
  mappedName: string,
  issuer: IssuerWithInfo
}
