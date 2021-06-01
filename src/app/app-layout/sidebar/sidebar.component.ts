import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AppLayoutQuery} from '../state/app-layout.query';
import {AppLayoutStore} from '../state/app-layout.store';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  constructor(private appLayoutQuery: AppLayoutQuery,
              private appLayoutStore: AppLayoutStore) {
  }

  hideNavbar(): void {
    if (this.appLayoutQuery.isSidebarOpen()) {
      this.appLayoutStore.toggleNavbarOpen();
    }
  }
}
