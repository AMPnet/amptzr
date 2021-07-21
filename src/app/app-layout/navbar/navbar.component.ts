import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {AppLayoutStore} from '../state/app-layout.store'
import {AppLayoutQuery} from '../state/app-layout.query'
import {Router} from '@angular/router'
import {SignerService} from 'src/app/shared/services/signer.service'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {

  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  navbarScreenLinks: NavbarItem[] = [
    {title: "Offers", routerLink: "offers"},
    {title: "Portfolio", routerLink: "portfolio"},
    {title: "Wallet", routerLink: "wallet"},
  ]

  constructor(private sessionQuery: SessionQuery,
              private appLayoutStore: AppLayoutStore,
              private appLayoutQuery: AppLayoutQuery,
              private signerService: SignerService,
              private router: Router) {
  }

  logout(): Observable<unknown> {
    return this.signerService.logout()
  }

  openRoute(route: string) {
    this.router.navigate([route])
  }

  toggleNavbarOpen(): void {
    this.appLayoutStore.toggleNavbarOpen()
  }
}

interface NavbarItem {
  title: string,
  routerLink?: string,
}
