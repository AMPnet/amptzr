import { Injectable } from '@angular/core'
import { BackendUserService } from '../shared/services/backend/backend-user.service'
import { switchMap } from 'rxjs/operators'
import { Observable, of, throwError } from 'rxjs'
import { MatDialog } from '@angular/material/dialog'
import { ProfileAddMandatoryComponent } from './profile-add-mandatory/profile-add-mandatory.component'

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(
    private userService: BackendUserService,
    private matDialog: MatDialog
  ) {}

  get ensureBasicInfo(): Observable<void> {
    return this.userService
      .getUser()
      .pipe(
        switchMap((user) =>
          user.email ? of(undefined) : this.openProfileAddModal
        )
      )
  }

  private get openProfileAddModal(): Observable<void> {
    return this.matDialog
      .open(ProfileAddMandatoryComponent)
      .afterClosed()
      .pipe(
        switchMap((completed) =>
          completed
            ? of(undefined)
            : throwError(() => 'PROFILE_ADD_MANDATORY_DISMISSED')
        )
      )
  }
}
