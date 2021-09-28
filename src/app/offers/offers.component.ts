import {ChangeDetectionStrategy, Component} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {QueryService} from '../shared/services/blockchain/query.service'
import {withStatus} from '../shared/utils/observables'
import {IssuerService} from '../shared/services/blockchain/issuer/issuer.service'
import {map, switchMap} from 'rxjs/operators'

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersComponent {
  offers$ = withStatus(
    this.issuerService.issuerOffersDisplaySettings$.pipe(
      switchMap(displaySettings => this.queryService.offers$.pipe(
        map(offers => offers.filter(
          offer => displaySettings.hiddenOffers.indexOf(offer.campaign.contractAddress) === -1
        ))
      ))
    ))

  constructor(private sessionQuery: SessionQuery,
              private queryService: QueryService,
              private issuerService: IssuerService) {
  }
}
