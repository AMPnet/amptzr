import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {concatMap, map, tap} from 'rxjs/operators'
import {from, Observable} from 'rxjs'
import {Router} from '@angular/router'
import {SessionQuery} from '../../session/state/session.query'
import {AppLayoutStore} from '../state/app-layout.store'
import {AppLayoutQuery} from '../state/app-layout.query'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  address$ = this.sessionQuery.address$.pipe(
    tap(() => ɵmarkDirty(this))
  );

  chainIDLoading = false;
  chainID$: Observable<number> = this.sessionQuery.provider$.pipe(
    tap(() => this.chainIDLoading = true),
    tap(() => ɵmarkDirty(this)),
    concatMap(provider => from(provider.getNetwork())),
    map(network => network.chainId),
    tap(() => this.chainIDLoading = false),
    tap(() => ɵmarkDirty(this)),
  );

  isNavbarOpen$ = this.appLayoutQuery.isSidebarOpen$;

  constructor(private sessionQuery: SessionQuery,
              private appLayoutStore: AppLayoutStore,
              private appLayoutQuery: AppLayoutQuery,
              private router: Router) {
  }

  toggleNavbarOpen(): void {
    this.appLayoutStore.toggleNavbarOpen()
  }
}
