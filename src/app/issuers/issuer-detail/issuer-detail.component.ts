import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {from, Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {ActivatedRoute} from '@angular/router'
import {SessionQuery} from '../../session/state/session.query'
import {switchMap, tap} from 'rxjs/operators'

@Component({
  selector: 'app-issuer-detail',
  templateUrl: './issuer-detail.component.html',
  styleUrls: ['./issuer-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuerDetailComponent {
  issuer$: Observable<WithStatus<IssuerWithInfo>>
  address$ = this.sessionQuery.address$.pipe(
    tap(() => ɵmarkDirty(this)),
  )

  constructor(private route: ActivatedRoute,
              private issuerService: IssuerService,
              private sessionQuery: SessionQuery) {
    const issuerAddress = this.route.snapshot.params.id
    this.issuer$ = this.sessionQuery.provider$.pipe(
      switchMap(provider =>
        withStatus(from(this.issuerService.getIssuerWithInfo(issuerAddress, provider))),
      ),
    )
  }
}
