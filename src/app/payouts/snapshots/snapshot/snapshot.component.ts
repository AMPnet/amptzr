import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BehaviorSubject, Observable, switchMap } from 'rxjs'
import { withStatus, WithStatus } from '../../../shared/utils/observables'
import { ActivatedRoute } from '@angular/router'
import {
  PayoutService,
  Snapshot,
  SnapshotStatus,
} from '../../../shared/services/backend/payout.service'

@Component({
  selector: 'app-snapshot',
  templateUrl: './snapshot.component.html',
  styleUrls: ['./snapshot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapshotComponent {
  snapshot$: Observable<WithStatus<Snapshot>>
  refreshSnapshotSub = new BehaviorSubject<void>(undefined)
  snapshotStatus = SnapshotStatus

  constructor(
    private payoutService: PayoutService,
    private route: ActivatedRoute
  ) {
    const snapshotID = this.route.snapshot.params.id

    this.snapshot$ = withStatus(
      this.refreshSnapshotSub
        .asObservable()
        .pipe(switchMap(() => this.payoutService.getSnapshot(snapshotID)))
    )
  }
}
