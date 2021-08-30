import {ChangeDetectionStrategy, Component} from '@angular/core'
import {combineLatest, Observable, of} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {AppLayoutStore} from '../state/app-layout.store'
import {AppLayoutQuery} from '../state/app-layout.query'
import {filter, map, tap} from 'rxjs/operators'
import {TailwindService} from '../../shared/services/tailwind.service'
import {UserService} from '../../shared/services/user.service'
import {SignerService} from '../../shared/services/signer.service'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {RouterService} from '../../shared/services/router.service'
import {IssuerService, IssuerWithInfo} from '../../shared/services/blockchain/issuer.service'
import {WithStatus} from '../../shared/utils/observables'

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
    {title: 'Offers', routerLink: '/offers', showItem: of(true)},
    {title: 'Portfolio', routerLink: '/portfolio', showItem: of(true)},
    {title: 'FAQ', routerLink: '/faq', showItem: of(true)},
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

    this.issuer$ = this.issuerService.issuerWithStatus$
    this.navbarScreenLinks.push(
      {
        title: 'Admin',
        routerLink: '/admin',
        showItem: combineLatest([
          this.isLoggedIn$,
          this.sessionQuery.address$,
          this.issuerService.issuer$
        ]).pipe(
          map(([isLoggedIn, address, issuer]) => {
            if (!isLoggedIn || !address) {
              return false
            }

            return address === issuer.owner
          })
        )
      }
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
