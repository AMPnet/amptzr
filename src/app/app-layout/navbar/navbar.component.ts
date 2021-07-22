import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable, of} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {AppLayoutStore} from '../state/app-layout.store'
import {AppLayoutQuery} from '../state/app-layout.query'
import {SignerService} from 'src/app/shared/services/signer.service'
import {filter, tap} from 'rxjs/operators'

// @ts-ignore
import tailwindConfig from '../../../../tailwind.config.js'
import {TailwindService} from '../../shared/services/tailwind.service'

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
              private signerService: SignerService,
              private tailwindService: TailwindService) {
    this.dropdownCloser$ = this.tailwindService.screenResize$.pipe(
      filter(screen => screen !== ('sm' || 'md')),
      tap(() => this.appLayoutStore.closeDropdownMenu()),
    )
  }

  logout(): Observable<unknown> {
    this.appLayoutStore.closeDropdownMenu()
    return this.signerService.logout()
  }

  toggleDropdown(): Observable<unknown> {
    return of(this.appLayoutStore.toggleDropdownMenu())
  }
}

interface NavbarItem {
  title: string,
  routerLink?: string,
}
