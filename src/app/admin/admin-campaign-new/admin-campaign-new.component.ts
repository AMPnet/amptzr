import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'

@Component({
  selector: 'app-admin-campaign-new',
  templateUrl: './admin-campaign-new.component.html',
  styleUrls: ['./admin-campaign-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignNewComponent {
  creationStep: 1 | 2 = 2
  createForm: FormGroup

  constructor(private fb: FormBuilder) {
    this.createForm = this.fb.group({
      logo: [undefined, Validators.required],
    })
  }
}
