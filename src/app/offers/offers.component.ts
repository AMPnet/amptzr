import {ChangeDetectionStrategy, Component} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {Observable} from 'rxjs'
import {tap} from 'rxjs/operators'
import {ethers} from 'ethers'

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersComponent {
  address$ = this.sessionQuery.address$;

  constructor(private sessionQuery: SessionQuery,
              private signerService: SignerService) {
  }

  signMessage(): Observable<string> {
    const message = 'YOLO'
    return this.signerService.signMessage(message).pipe(
      tap(signed => {
        console.log('signed message author:', ethers.utils.verifyMessage(message, signed))
      })
    )
  }
}
