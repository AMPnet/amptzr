import {ChangeDetectionStrategy, Component} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {Observable} from 'rxjs'
import {concatMap, tap} from 'rxjs/operators'
import {ethers} from 'ethers'
import {DialogService} from '../shared/services/dialog.service'

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersComponent {
  address$ = this.sessionQuery.address$;

  constructor(private sessionQuery: SessionQuery,
              private signerService: SignerService,
              private dialogService: DialogService) {
  }

  signMessage(): Observable<unknown> {
    const message = 'YOLO'
    return this.signerService.signMessage(message).pipe(
      tap(signed => this.dialogService.info(
        `The address of the author that signed the message: ${ethers.utils.verifyMessage(message, signed)}`, false
      ).subscribe()),
    )
  }
}
