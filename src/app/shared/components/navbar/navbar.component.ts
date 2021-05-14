import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core';
import {SessionQuery} from '../../../session/state/session.query';
import {tap} from 'rxjs/operators';

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

  constructor(private sessionQuery: SessionQuery) {
  }
}
