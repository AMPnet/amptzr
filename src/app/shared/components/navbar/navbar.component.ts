import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core';
import {SessionQuery} from '../../../session/state/session.query';
import {concatMap, map, tap} from 'rxjs/operators';
import {from} from 'rxjs';
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
  chainID$ = this.sessionQuery.provider$.pipe(
    concatMap(provider => from(provider.getNetwork())),
    map(network => network.chainId),
    tap(() => ɵmarkDirty(this)),
  );

  constructor(private sessionQuery: SessionQuery,
              private router: Router) {
  }
}
