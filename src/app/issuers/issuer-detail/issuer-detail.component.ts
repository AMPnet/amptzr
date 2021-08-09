import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {ActivatedRoute} from '@angular/router'
import {SessionQuery} from '../../session/state/session.query'
import {map, tap} from 'rxjs/operators'
import {AssetService, AssetWithInfo} from '../../shared/services/blockchain/asset.service'

@Component({
    selector: 'app-issuer-detail',
    templateUrl: './issuer-detail.component.html',
    styleUrls: ['./issuer-detail.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuerDetailComponent {
    issuer$: Observable<WithStatus<IssuerWithInfo>>
    assets$: Observable<WithStatus<AssetWithInfo[]>>
    address$ = this.sessionQuery.address$.pipe(
        map(value => ({value: value})),
        tap(() => ɵmarkDirty(this)),
    )

    constructor(private route: ActivatedRoute,
                private issuerService: IssuerService,
                private assetService: AssetService,
                private sessionQuery: SessionQuery) {
        const issuerAddress = this.route.snapshot.params.id
        this.issuer$ = withStatus(this.issuerService.getIssuerWithInfo(issuerAddress))
        this.assets$ = withStatus(this.assetService.getAssets(issuerAddress))
    }
}
