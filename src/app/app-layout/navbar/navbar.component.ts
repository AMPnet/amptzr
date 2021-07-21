import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core'
import {BehaviorSubject, fromEvent, Observable, of} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {AppLayoutStore} from '../state/app-layout.store'
import {AppLayoutQuery} from '../state/app-layout.query'
import {Router} from '@angular/router'
import {SignerService} from 'src/app/shared/services/signer.service'
import { debounceTime } from 'rxjs/operators'
import resolveConfig from 'tailwindcss/resolveConfig'

// Tailwind config doesn't have type definitions, ignoring for linter and editor satisfaction
// @ts-ignore
import tailwindConfig from '../../../../tailwind.config.js'


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {

  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  isDropdownOpen$ = this.appLayoutQuery.isDropdownMenuOpen$

  navbarScreenLinks: NavbarItem[] = [
    {title: "Offers", routerLink: "offers"},
    {title: "Portfolio", routerLink: "portfolio"},
    {title: "Wallet", routerLink: "wallet"},
    {title: "FAQ", routerLink: "faq"}
  ]

  constructor(private sessionQuery: SessionQuery,
              private appLayoutStore: AppLayoutStore,
              private appLayoutQuery: AppLayoutQuery,
              private signerService: SignerService,
              private router: Router) {
  }

  ngOnInit() {
    this.forceCloseDropdownOnResize()
  }

  // Handle undefined state where dropdown remains opened if screen is 
  // resized from smaller to bigger while dropdown is open
  forceCloseDropdownOnResize() {
    fromEvent(window, 'resize').pipe(debounceTime(300)).subscribe(event => {
      let breakWidth = 
        resolveConfig(tailwindConfig)
        .theme.screens?.lg
        .replace('px','') ?? '0'
      if(parseInt(breakWidth) < (event.currentTarget as Window).innerWidth) {
        this.appLayoutStore.forceCloseDropdownMenu()
      }
    })
  }

  logout(): Observable<unknown> {
    this.appLayoutStore.forceCloseDropdownMenu()
    return this.signerService.logout()
  }

  toggleDropdown(): Observable<unknown> {
    this.appLayoutStore.toggleDropdownMenu()
    return of({})
  }

  openRoute(route: string) {
    this.router.navigate([route])
  }
}

interface NavbarItem {
  title: string,
  routerLink?: string,
}
