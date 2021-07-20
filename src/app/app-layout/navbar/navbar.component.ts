import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {concatMap, distinctUntilChanged, map, tap} from 'rxjs/operators'
import {from, Observable} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {AppLayoutStore} from '../state/app-layout.store'
import {AppLayoutQuery} from '../state/app-layout.query'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import { Router } from '@angular/router'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {

  navbarItems: NavbarItem[] = [
    { title: "Offers", routerLink: "offers" },
    { title: "My Portfolio" , routerLink: "portfolio"},
    { title: "Wallet", routerLink: "wallet" }
  ]

  constructor(private sessionQuery: SessionQuery,
              private appLayoutStore: AppLayoutStore,
              private appLayoutQuery: AppLayoutQuery,
              private router: Router) { }

  openRoute(route: string) {
    this.router.navigate([route])
  }

  toggleNavbarOpen(): void {
    this.appLayoutStore.toggleNavbarOpen()
  }
}

interface NavbarItem {
  title: string,
  routerLink: string
}
