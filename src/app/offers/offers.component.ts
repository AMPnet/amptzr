import {ChangeDetectionStrategy, Component} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {QueryService} from '../shared/services/blockchain/query.service'

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersComponent {
  offers$ = this.queryService.offers$

  constructor(private sessionQuery: SessionQuery,
              private queryService: QueryService) {
  }
}
