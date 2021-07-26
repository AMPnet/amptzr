import {Injectable} from '@angular/core'
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router'
import {SessionQuery} from 'src/app/session/state/session.query'

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private sessionQuery: SessionQuery,
              private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.sessionQuery.isLoggedIn()) {
      return this.router.parseUrl('/')
    } else {
      return true
    }
  }
}
