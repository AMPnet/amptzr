import {Injectable} from '@angular/core'
import {Query} from '@datorama/akita'
import {PreferenceState, PreferenceStore} from './preference.store'
import {map} from 'rxjs/operators'
import {Networks} from '../../shared/networks'

@Injectable({providedIn: 'root'})
export class PreferenceQuery extends Query<PreferenceState> {
  constructor(protected store: PreferenceStore) {
    super(store)
  }

  network$ = this.select('chainID').pipe(
    map(chainID => Networks[chainID]),
  )
  issuer$ = this.select('issuer')

  get network() {
    return Networks[this.getValue().chainID]
  }

  get issuer() {
    return this.getValue().issuer
  }
}
