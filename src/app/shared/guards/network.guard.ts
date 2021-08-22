import {Injectable} from '@angular/core'
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router'
import {Observable, of} from 'rxjs'
import {catchError, map, switchMap, tap} from 'rxjs/operators'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {PreferenceStore} from '../../preference/state/preference.store'
import {ChainID, Networks} from '../networks'

@Injectable({
  providedIn: 'root',
})
export class NetworkGuard implements CanActivate {
  constructor(private preferenceQuery: PreferenceQuery,
              private preferenceStore: PreferenceStore) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return of(route.params.chainID).pipe(
      map(chainID => Number(chainID) as ChainID),
      tap(chainID => this.preferenceStore.update({
        chainID: Networks[chainID].chainID,
      })),
      switchMap(() => of(true)),
      catchError(() => of(false)),
    )
  }
}
