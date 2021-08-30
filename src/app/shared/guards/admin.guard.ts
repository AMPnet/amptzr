import {Injectable} from '@angular/core'
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router'
import {SessionQuery} from 'src/app/session/state/session.query'
import {map} from 'rxjs/operators'
import {combineLatest, Observable} from 'rxjs'
import {IssuerService} from '../services/blockchain/issuer.service'
import {RouterService} from '../services/router.service'
import {PreferenceQuery} from '../../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private issuerService: IssuerService,
              private router: RouterService,) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return combineLatest([
      this.sessionQuery.address$,
      this.issuerService.issuer$,
    ]).pipe(
      map(([address, issuer]) => {
        if (!address || address !== issuer.owner) {
          return this.router.router.createUrlTree([
            `/${this.preferenceQuery.network.chainID}`,
            issuer.ansName,
            'offers'
          ])
        }

        return true
      })
    )
  }
}
