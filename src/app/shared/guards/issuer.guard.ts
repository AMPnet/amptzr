import {Injectable} from '@angular/core'
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router'
import {Observable, of} from 'rxjs'
import {switchMap, tap} from 'rxjs/operators'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {PreferenceStore} from '../../preference/state/preference.store'
import {IssuerService} from '../services/blockchain/issuer.service'
import {SessionQuery} from '../../session/state/session.query'

@Injectable({
  providedIn: 'root',
})
export class IssuerGuard implements CanActivate {
  constructor(private preferenceQuery: PreferenceQuery,
              private preferenceStore: PreferenceStore,
              private sessionQuery: SessionQuery,
              private issuerService: IssuerService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return of(route.params.issuer).pipe(
      switchMap(issuer => this.issuerService.getAddressByName(issuer)),
      switchMap(issuerAddress => this.issuerService.getState(issuerAddress, this.sessionQuery.provider)),
      tap(issuer => this.preferenceStore.update({
        issuer: {
          address: issuer.contractAddress,
          slug: issuer.ansName,
          createdByAddress: issuer.createdBy,
        },
      })),
      switchMap(() => of(true)),
    )
  }
}
