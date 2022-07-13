import { ChangeDetectionStrategy, Component } from '@angular/core'
import { defer, Observable } from 'rxjs'
import { withStatus, WithStatus } from '../../shared/utils/observables'
import {
  PayoutService,
  Snapshot,
  SnapshotStatus,
} from '../../shared/services/backend/payout.service'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-snapshots',
  templateUrl: './snapshots.component.html',
  styleUrls: ['./snapshots.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapshotsComponent {
  snapshots$: Observable<WithStatus<Snapshot[]>>
  snapshotStatus = SnapshotStatus

  constructor(private payoutService: PayoutService) {
    this.snapshots$ = withStatus(
      defer(() =>
        this.payoutService
          .getSnapshots()
          .pipe(
            map((snapshots) =>
              snapshots.sort((a, b) =>
                Number(a.asset_snapshot_block_number) <
                Number(b.asset_snapshot_block_number)
                  ? 1
                  : -1
              )
            )
          )
      )
    )
  }
}
