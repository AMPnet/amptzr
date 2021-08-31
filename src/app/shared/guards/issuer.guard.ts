import {Injectable} from '@angular/core'
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router'
import {combineLatest, Observable, of} from 'rxjs'
import {switchMap, take, tap} from 'rxjs/operators'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {PreferenceStore} from '../../preference/state/preference.store'
import {IssuerService} from '../services/blockchain/issuer.service'
import {SessionQuery} from '../../session/state/session.query'
import {environment} from '../../../environments/environment'
import {StablecoinService} from '../services/blockchain/stablecoin.service'
import {DialogService} from '../services/dialog.service'

@Injectable({
  providedIn: 'root',
})
export class IssuerGuard implements CanActivate {
  constructor(private preferenceQuery: PreferenceQuery,
              private preferenceStore: PreferenceStore,
              private sessionQuery: SessionQuery,
              private stablecoin: StablecoinService,
              private dialogService: DialogService,
              private issuerService: IssuerService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const activation$ = of(environment.fixed.issuer || route.params.issuer as string).pipe(
      // TODO: handle error cases
      // TODO: handle getting issuers also by id (number)
      switchMap(issuer => {
        if (issuer.startsWith('0x')) {
          return of(issuer)
        } else {
          return this.issuerService.getAddressByName(issuer)
        }
      }),
      switchMap(issuerAddress => this.issuerService.getState(issuerAddress, this.sessionQuery.provider)),
      tap(issuer => this.preferenceStore.update({
        issuer: {
          address: issuer.contractAddress,
          slug: issuer.ansName,
          // TODO: use this to reset stale issuer in preference when issuerFactory address changes.
          // we should automatically log out the current user in this case.
          createdByAddress: issuer.createdBy,
        },
      })),
      // this is needed to reload the latest issuer config
      switchMap(() => combineLatest([this.stablecoin.contract$]).pipe(take(1))),
      switchMap(() => of(true)),
    )

    return this.dialogService.overlayLoading(activation$, '')
  }
}
