import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AppLayoutQuery} from './state/app-layout.query';
import {AppLayoutStore} from './state/app-layout.store';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppLayoutComponent implements OnInit {
  isOpen$ = this.appLayoutQuery.isSidebarOpen$;

  constructor(private appLayoutQuery: AppLayoutQuery,
              private appLayoutStore: AppLayoutStore) {
  }

  ngOnInit(): void {
  }

  hideNavbar(): void {
    if (this.appLayoutQuery.isSidebarOpen()) {
      this.appLayoutStore.toggleNavbarOpen();
    }
  }
}
