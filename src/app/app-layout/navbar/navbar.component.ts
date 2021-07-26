import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable, of} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {AppLayoutStore} from '../state/app-layout.store'
import {AppLayoutQuery} from '../state/app-layout.query'
import {filter, finalize, tap} from 'rxjs/operators'
import {TailwindService} from '../../shared/services/tailwind.service'
import {Router} from '@angular/router'
import {UserService} from '../../shared/services/user.service'
import {SignerService} from '../../shared/services/signer.service'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  isLoggedIn$ = this.sessionQuery.isLoggedIn$
  isDropdownOpen$ = this.appLayoutQuery.isDropdownMenuOpen$
  dropdownCloser$: Observable<unknown>

  navbarScreenLinks: NavbarItem[] = [
    {title: "Offers", routerLink: "offers"},
    {title: "Portfolio", routerLink: "portfolio"},
    {title: "Wallet", routerLink: "wallet"},
    {title: "FAQ", routerLink: "faq"},
  ]

  constructor(private sessionQuery: SessionQuery,
              private appLayoutStore: AppLayoutStore,
              private appLayoutQuery: AppLayoutQuery,
              private userService: UserService,
              private router: Router,
              private signerService: SignerService,
              private tailwindService: TailwindService) {
    this.dropdownCloser$ = this.tailwindService.screenResize$.pipe(
      filter(screen => screen !== ('sm' || 'md')),
      tap(() => this.appLayoutStore.closeDropdownMenu()),
    )
  }

  login(): Observable<unknown> {
    return this.signerService.ensureAuth.pipe(
      tap(() => this.appLayoutStore.closeDropdownMenu()),
    )
  }

  logout(): Observable<unknown> {
    return this.userService.logout().pipe(
      tap(() => this.appLayoutStore.closeDropdownMenu()),
      finalize(() => this.router.navigate(['/'])),
    )
  }

  toggleDropdown(): Observable<unknown> {
    return of(this.appLayoutStore.toggleDropdownMenu())
  }
}

interface NavbarItem {
  title: string,
  routerLink?: string,
}
