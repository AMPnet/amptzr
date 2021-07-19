import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {concatMap, distinctUntilChanged, map, tap} from 'rxjs/operators'
import {from, Observable} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {AppLayoutStore} from '../state/app-layout.store'
import {AppLayoutQuery} from '../state/app-layout.query'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import { Router } from '@angular/router'

interface NavbarItem {
    title: string,
    routerLink: string,
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {

  navbarItems: NavbarItem[];

  address$ = this.sessionQuery.address$.pipe(
    tap(() => ɵmarkDirty(this))
  );

  chainID$: Observable<WithStatus<number>> = this.sessionQuery.provider$.pipe(
    distinctUntilChanged(),
    concatMap(provider => withStatus(from(provider.getNetwork())
      .pipe(map(network => network.chainId)))),
    tap(() => ɵmarkDirty(this)),
  );



  isNavbarOpen$ = this.appLayoutQuery.isSidebarOpen$;

  constructor(private sessionQuery: SessionQuery,
              private appLayoutStore: AppLayoutStore,
              private appLayoutQuery: AppLayoutQuery,
              private router: Router) {

      this.navbarItems = [
        { title: "Portfolio" , routerLink: "portfolio"},
        { title: "Offers", routerLink: "offers" },
        { title: "Wallet", routerLink: "wallet" }
      ]
  }

  openRoute(route: string) {
    this.router.navigate([route])
  }

  toggleNavbarOpen(): void {
    this.appLayoutStore.toggleNavbarOpen()
  }
}
