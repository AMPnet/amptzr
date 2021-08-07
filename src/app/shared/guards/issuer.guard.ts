import {Injectable} from '@angular/core'
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router'
import {Observable, of} from 'rxjs'
import {switchMap, tap} from 'rxjs/operators'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {PreferenceStore} from '../../preference/state/preference.store'

@Injectable({
  providedIn: 'root',
})
export class IssuerGuard implements CanActivate {
  constructor(private preferenceQuery: PreferenceQuery,
              private preferenceStore: PreferenceStore) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return of(route.params.issuer).pipe(
      tap(issuer => this.preferenceStore.update({
        issuer: {
          address: issuer,
        },
      })),
      switchMap(issuer => of(true)),
    )
  }
}
