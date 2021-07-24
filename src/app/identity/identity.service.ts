import {Injectable} from '@angular/core'
import {Observable, of} from 'rxjs'
import {map, switchMap} from 'rxjs/operators'
import {VeriffService} from './veriff/veriff.service'
import {BackendUserService} from '../shared/services/backend/backend-user.service'

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  constructor(private backendUser: BackendUserService,
              private veriffService: VeriffService) {
  }

  get ensureIdentityChecked(): Observable<void> {
    return this.identityChecked.pipe(
      switchMap(identityChecked => identityChecked ? of(undefined) : this.openIdentityDialog),
      map(() => undefined),
    )
  }

  private get identityChecked(): Observable<boolean> {
    return this.backendUser.getUser().pipe(
      map(user => user.kyc_completed),
    )
  }

  private get openIdentityDialog(): Observable<void> {
    return this.veriffService.openVeriffDialog()
  }
}
