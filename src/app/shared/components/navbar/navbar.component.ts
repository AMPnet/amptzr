import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core';
import {SessionQuery} from '../../../session/state/session.query';
import {concatMap, map, startWith, tap} from 'rxjs/operators';
import {EMPTY, from, NEVER, Observable, of} from 'rxjs';
import {Router} from '@angular/router';

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

  constructor(private sessionQuery: SessionQuery,
              private router: Router) {
  }
}
