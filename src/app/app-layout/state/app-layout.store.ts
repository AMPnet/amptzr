import {Injectable} from '@angular/core'
import {Store, StoreConfig} from '@datorama/akita'

export interface AppLayoutState {
  isDropdownMenuOpen: boolean;
}

export function createInitialState(): AppLayoutState {
  return {
    isDropdownMenuOpen: false,
  }
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'app-layout'})
export class AppLayoutStore extends Store<AppLayoutState> {
  constructor() {
    super(createInitialState())
  }

  toggleDropdownMenu(): void {
    return this.update(state => ({
      ...state,
      isDropdownMenuOpen: !state.isDropdownMenuOpen,
    }))
  }

  closeDropdownMenu(): void {
    return this.update(state => ({
      ...state,
      isDropdownMenuOpen: false,
    }))
  }
}
