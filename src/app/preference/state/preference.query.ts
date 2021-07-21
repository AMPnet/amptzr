import {Injectable} from '@angular/core'
import {Query} from '@datorama/akita'
import {PreferenceState, PreferenceStore} from './preference.store'

@Injectable({providedIn: 'root'})
export class PreferenceQuery extends Query<PreferenceState> {
  constructor(protected store: PreferenceStore) {
    super(store)
  }
}
