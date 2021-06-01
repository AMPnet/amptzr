import {Injectable} from '@angular/core'
import {Query} from '@datorama/akita'
import {AppLayoutState, AppLayoutStore} from './app-layout.store'
import {Observable} from 'rxjs'

@Injectable({providedIn: 'root'})
export class AppLayoutQuery extends Query<AppLayoutState> {
  isSidebarOpen$: Observable<boolean> = this.select('isSidebarOpen');

  constructor(protected store: AppLayoutStore) {
    super(store)
  }

  isSidebarOpen(): boolean {
    return this.getValue().isSidebarOpen
  }
}
