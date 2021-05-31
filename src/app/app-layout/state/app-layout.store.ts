import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';

export interface AppLayoutState {
  isSidebarOpen: boolean;
}

export function createInitialState(): AppLayoutState {
  return {
    isSidebarOpen: false,
  };
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'app-layout'})
export class AppLayoutStore extends Store<AppLayoutState> {
  constructor() {
    super(createInitialState());
  }

  toggleNavbarOpen(): void {
    return this.update(state => ({
      ...state,
      isSidebarOpen: !state.isSidebarOpen
    }));
  }
}
