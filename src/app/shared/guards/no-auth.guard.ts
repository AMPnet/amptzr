import {Injectable} from '@angular/core'
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router'
import {SessionQuery} from 'src/app/session/state/session.query'
import {RouterService} from '../services/router.service'

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private sessionQuery: SessionQuery,
              private router: RouterService) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.sessionQuery.isLoggedIn()) {
      return this.router.router.parseUrl('/')
    } else {
      return true
    }
  }
}
