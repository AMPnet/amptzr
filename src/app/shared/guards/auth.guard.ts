import {Injectable} from '@angular/core'
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router'
import {SessionQuery} from 'src/app/session/state/session.query'
import {SignerService} from '../services/signer.service'
import {catchError, map} from 'rxjs/operators'
import {of} from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private sessionQuery: SessionQuery,
              private signerService: SignerService) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.signerService.ensureAuth.pipe(
      map(signer => !!signer),
      catchError(() => of(false)),
    )
  }
}
