import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router'
import { map, take } from 'rxjs/operators'
import { combineLatest, Observable } from 'rxjs'
import { UserService } from '../services/user.service'

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return combineLatest([this.userService.isAdmin$]).pipe(
      take(1),
      map(([isAdmin]) => isAdmin)
    )
  }
}
