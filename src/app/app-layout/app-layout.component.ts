import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AppLayoutQuery} from './state/app-layout.query';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppLayoutComponent implements OnInit {
  isOpen$ = this.appLayoutQuery.isSidebarOpen$;

  constructor(private appLayoutQuery: AppLayoutQuery) {
  }

  ngOnInit(): void {
  }
}
