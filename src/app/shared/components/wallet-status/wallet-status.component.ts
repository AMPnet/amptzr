import {ChangeDetectionStrategy, Component, NgZone} from '@angular/core'
import {MatDialog} from '@angular/material/dialog'
import {ActivatedRoute, NavigationEnd} from '@angular/router'
import {SessionQuery} from '../../../session/state/session.query'
import {combineLatest, Observable} from 'rxjs'
import {filter, map, startWith} from 'rxjs/operators'
import {RouterService} from '../../services/router.service'

@Component({
  selector: 'app-wallet-status',
  templateUrl: './wallet-status.component.html',
  styleUrls: ['./wallet-status.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletStatusComponent {
  shouldShowLogin$: Observable<boolean> = combineLatest([
    this.sessionQuery.isLoggedIn$,
    this.router.router.events.pipe(
      startWith(new NavigationEnd(1, this.router.router.url, this.router.router.url)),
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url),
    )]).pipe(
    map(([isLoggedIn, url]) => {
      return isLoggedIn || url === '/wallet'
    }),
  )

  constructor(private dialog: MatDialog,
              private sessionQuery: SessionQuery,
              private ngZone: NgZone,
              private route: ActivatedRoute,
              private router: RouterService) {
  }

  walletConnect(): void {
    this.ngZone.run(() => {
      this.router.navigate(['/auth'])
    })
  }
}
