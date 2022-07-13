import { ChangeDetectionStrategy, Component, Optional } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatDialogRef } from '@angular/material/dialog'
import { BackendUserService } from '../../shared/services/backend/backend-user.service'

@Component({
  selector: 'app-auth-magic',
  templateUrl: './auth-magic.component.html',
  styleUrls: ['./auth-magic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthMagicComponent {
  emailForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private userService: BackendUserService,
    @Optional() private dialogRef: MatDialogRef<AuthMagicComponent>
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  loginWithEmail() {
    this.dialogRef.close({
      email: this.emailForm.get('email')?.value!,
    } as MagicLoginInput)
  }
}

export interface MagicLoginInput {
  email: string
}
