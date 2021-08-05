import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset.service'
import {map, tap} from 'rxjs/operators'
import {ActivatedRoute} from '@angular/router'
import {SessionQuery} from '../../session/state/session.query'

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDetailComponent {
  asset$: Observable<WithStatus<AssetWithInfo>>
  address$ = this.sessionQuery.address$.pipe(
    map(value => ({value: value})),
    tap(() => ɵmarkDirty(this)),
  )

  constructor(private route: ActivatedRoute,
              private assetService: AssetService,
              private sessionQuery: SessionQuery) {
    const assetAddress = this.route.snapshot.params.id
    this.asset$ = withStatus(this.assetService.getAssetWithInfo(assetAddress))
  }
}
