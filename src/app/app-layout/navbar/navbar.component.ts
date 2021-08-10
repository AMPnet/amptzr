import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable, of} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {AppLayoutStore} from '../state/app-layout.store'
import {AppLayoutQuery} from '../state/app-layout.query'
import {filter, finalize, switchMap, tap} from 'rxjs/operators'
import {TailwindService} from '../../shared/services/tailwind.service'
import {UserService} from '../../shared/services/user.service'
import {SignerService} from '../../shared/services/signer.service'
import {RouterService} from '../../shared/services/router.service'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {PreferenceQuery} from '../../preference/state/preference.query'

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
  issuer$: Observable<WithStatus<IssuerWithInfo>>

  navbarScreenLinks: NavbarItem[] = [
    {title: "Offers", routerLink: "/offers"},
    {title: "Portfolio", routerLink: "/portfolio"},
    {title: "FAQ", routerLink: "/faq"},
  ]

  constructor(private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private issuerService: IssuerService,
              private appLayoutStore: AppLayoutStore,
              private appLayoutQuery: AppLayoutQuery,
              private userService: UserService,
              private router: RouterService,
              private signerService: SignerService,
              private tailwindService: TailwindService) {
    this.dropdownCloser$ = this.tailwindService.screenResize$.pipe(
      filter(screen => screen !== ('sm' || 'md')),
      tap(() => this.appLayoutStore.closeDropdownMenu()),
    )

    this.issuer$ = this.preferenceQuery.issuer$.pipe(
      switchMap(issuer => withStatus(this.issuerService.getIssuerWithInfo(issuer.address))),
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
}
