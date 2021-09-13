import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable, of} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {AppLayoutStore} from '../state/app-layout.store'
import {AppLayoutQuery} from '../state/app-layout.query'
import {filter, map, tap} from 'rxjs/operators'
import {TailwindService} from '../../shared/services/tailwind.service'
import {UserService} from '../../shared/services/user.service'
import {SignerService} from '../../shared/services/signer.service'
import {IssuerService} from '../../shared/services/blockchain/issuer.service'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  isLoggedIn$ = this.sessionQuery.isLoggedIn$
  isDropdownOpen$ = this.appLayoutQuery.isDropdownMenuOpen$
  issuer$ = this.issuerService.issuerWithStatus$
  isMobileScreen$: Observable<boolean>
  dropdownCloser$: Observable<unknown>
  isAdmin$ = this.userService.isAdmin$

  navbarScreenLinks: NavbarItem[] = [
    {title: 'Offers', routerLink: '/offers', showItem: of(true)},
    {title: 'Portfolio', routerLink: '/portfolio', showItem: this.isLoggedIn$},
    {title: 'FAQ', routerLink: '/faq', showItem: of(true)},
    {title: 'Admin', routerLink: '/admin', showItem: this.isAdmin$},
  ]

  constructor(private sessionQuery: SessionQuery,
              private issuerService: IssuerService,
              private appLayoutStore: AppLayoutStore,
              private appLayoutQuery: AppLayoutQuery,
              private userService: UserService,
              private signerService: SignerService,
              private tailwindService: TailwindService) {
    this.isMobileScreen$ = this.tailwindService.screenResize$.pipe(
      map(screen => screen === ('sm' || 'md')),
    )
    this.dropdownCloser$ = this.isMobileScreen$.pipe(
      filter(isMobile => !isMobile),
      tap(() => this.appLayoutStore.closeDropdownMenu()),
    )
  }

  login(): Observable<unknown> {
    return this.signerService.ensureAuth.pipe(
      tap(() => this.appLayoutStore.closeDropdownMenu()),
    )
  }

  toggleDropdown(): Observable<unknown> {
    return of(this.appLayoutStore.toggleDropdownMenu())
  }
}

interface NavbarItem {
  title: string,
  routerLink?: string,
  showItem: Observable<boolean>,
}
