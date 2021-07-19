import {ChangeDetectionStrategy, Component, NgZone} from '@angular/core'
import {MatDialog} from '@angular/material/dialog'
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router'
import {SessionQuery} from '../../../session/state/session.query'
import {combineLatest, Observable} from 'rxjs'
import {filter, map, startWith} from 'rxjs/operators'

@Component({
  selector: 'app-wallet-status',
  templateUrl: './wallet-status.component.html',
  styleUrls: ['./wallet-status.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletStatusComponent {
  shouldShowLogin$: Observable<boolean> = combineLatest([
    this.sessionQuery.isLoggedIn$,
    this.router.events.pipe(
      startWith(new NavigationEnd(1, this.router.url, this.router.url)),
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url)
    )]).pipe(
    map(([isLoggedIn, url]) => {
      return isLoggedIn || url === '/wallet'
    })
  );

  constructor(private dialog: MatDialog,
              private sessionQuery: SessionQuery,
              private ngZone: NgZone,
              private route: ActivatedRoute,
              private router: Router) {
  }

  walletConnect(): void {
    this.ngZone.run(() => {
      this.router.navigate(['/auth'])
    })
  }
}
