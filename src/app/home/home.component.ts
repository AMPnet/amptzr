import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { combineLatest, Observable, of } from 'rxjs'
import { WithStatus, withStatus } from '../shared/utils/observables'
import { map, switchMap } from 'rxjs/operators'
import { RouterService } from '../shared/services/router.service'
import {
  IssuerService,
  IssuerWithInfo,
} from '../shared/services/blockchain/issuer/issuer.service'
import { QueryService } from '../shared/services/blockchain/query.service'
import { ChainID } from '../shared/networks'
import { PreferenceQuery } from '../preference/state/preference.query'
import { PreferenceService } from '../preference/state/preference.service'
import { SessionQuery } from '../session/state/session.query'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  featuredMappings: { [key in ChainID]?: string[] } = {
    [ChainID.MATIC_MAINNET]: ['0x950c8472c5bb8a10e111646a3de7fd226306b5cf'],
    [ChainID.MUMBAI_TESTNET]: ['0x5d1800560a29ba3e8130D2B48Bd4c510a506DD62'],
  }

  networkAndAddress$ = combineLatest([
    this.preferenceQuery.network$,
    this.preferenceQuery.address$,
  ])

  featuredAddrs$: Observable<string[]> = this.networkAndAddress$.pipe(
    map(([network, _address]) => this.featuredMappings[network.chainID] || [])
  )

  featuredIssuers$: Observable<WithStatus<IssuerItem[]>> =
    this.featuredAddrs$.pipe(
      switchMap((issuersAddrs) =>
        withStatus(
          issuersAddrs.length === 0
            ? of([])
            : combineLatest(
                issuersAddrs.map((address) =>
                  this.queryService
                    .getIssuerForAddress(address)
                    .pipe(
                      switchMap((issuer) =>
                        this.issuerService
                          .getIssuerInfo(issuer.issuer)
                          .pipe(
                            map((i) => ({
                              mappedName: issuer.mappedName,
                              issuer: i,
                            }))
                          )
                      )
                    )
                )
              )
        )
      )
    )

  myIssuers$: Observable<WithStatus<IssuerItem[]>> =
    this.networkAndAddress$.pipe(
      switchMap(() =>
        withStatus(
          this.queryService.issuers$.pipe(
            map((items) =>
              items.filter(
                (item) =>
                  item.issuer.owner.toLowerCase() ===
                  this.preferenceQuery.getValue().address.toLowerCase()
              )
            ),
            switchMap((issuers) =>
              issuers.length === 0
                ? of([])
                : combineLatest(
                    issuers.map((issuer) =>
                      this.issuerService
                        .getIssuerInfo(issuer.issuer)
                        .pipe(
                          map((i) => ({
                            mappedName: issuer.mappedName,
                            issuer: i,
                          }))
                        )
                    )
                  )
            )
          )
        )
      )
    )

  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  constructor(
    private issuerService: IssuerService,
    private router: RouterService,
    private preferenceQuery: PreferenceQuery,
    private sessionQuery: SessionQuery,
    private preferenceService: PreferenceService,
    private queryService: QueryService
  ) {}

  ngOnInit() {
    this.preferenceService.resetIssuer()
  }

  openIssuer(issuer: IssuerItem) {
    return this.router.navigateIssuer(
      issuer.mappedName || issuer.issuer.contractAddress
    )
  }

  openCreateNewIssuer() {
    return this.router.navigateNetwork(['/admin/issuers/new'])
  }
}

interface IssuerItem {
  mappedName: string
  issuer: IssuerWithInfo
}
