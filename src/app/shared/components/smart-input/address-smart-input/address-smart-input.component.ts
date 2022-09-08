import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { BehaviorSubject } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { UserService } from 'src/app/shared/services/user.service'

@Component({
  selector: 'app-address-smart-input',
  templateUrl: './address-smart-input.component.html',
  styleUrls: ['./address-smart-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressSmartInputComponent {

  inputs = [1,2,3,4,5,6,7]

  custmInputForm = new FormGroup({
    customAddressInput: new FormControl('', [Validators.required])
  })

  // @ViewChild('customAddressInput') customAddressInput!: ElementRef<InputEleme>

  @Input() selectedSub?: BehaviorSubject<string | null>

  constructor(private preferenceQuery: PreferenceQuery) { }

  myAddressClicked() {
     this.custmInputForm.controls
        .customAddressInput.setValue(this.preferenceQuery.getValue().address)
  }

  confirmAddressClicked() {
    this.selectedSub?.next(this.custmInputForm.controls.customAddressInput.value)
  }

}
