import {Injectable} from '@angular/core'
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router'
import {SessionQuery} from 'src/app/session/state/session.query'

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private sessionQuery: SessionQuery,
              private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.sessionQuery.isLoggedIn()) {
      this.router.navigate(['/auth'])
      return false
    }
    return true
  }
}
