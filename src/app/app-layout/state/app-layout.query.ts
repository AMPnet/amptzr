import {Injectable} from '@angular/core'
import {Query} from '@datorama/akita'
import {AppLayoutState, AppLayoutStore} from './app-layout.store'
import {Observable} from 'rxjs'

@Injectable({providedIn: 'root'})
export class AppLayoutQuery extends Query<AppLayoutState> {
  isDropdownMenuOpen$: Observable<boolean> = this.select('isDropdownMenuOpen')

  constructor(protected store: AppLayoutStore) {
    super(store)
  }

  isDropdownMenuOpen(): boolean {
    return this.getValue().isDropdownMenuOpen
  }
}
