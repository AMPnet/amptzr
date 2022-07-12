import { ChangeDetectionStrategy, Component, Optional } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Observable } from 'rxjs'
import { BackendUserService } from '../../shared/services/backend/backend-user.service'
import { tap } from 'rxjs/operators'
import { MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'app-profile-add-mandatory',
  templateUrl: './profile-add-mandatory.component.html',
  styleUrls: ['./profile-add-mandatory.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileAddMandatoryComponent {
  updateForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private userService: BackendUserService,
    @Optional() private dialogRef: MatDialogRef<ProfileAddMandatoryComponent>
  ) {
    this.updateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  submit(): Observable<unknown> {
    return this.userService
      .updateUser({
        email: this.updateForm.get('email')?.value!,
      })
      .pipe(tap(() => this.dialogRef.close(true)))
  }
}
