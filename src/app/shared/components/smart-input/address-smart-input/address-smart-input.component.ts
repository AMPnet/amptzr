import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ethers } from 'ethers'
import { BehaviorSubject, from, switchMap, tap } from 'rxjs'
import { AddressBookService } from 'src/app/dashboard/address-book/address-book.service'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { UserService } from 'src/app/shared/services/user.service'
import 'ethers'

@Component({
  selector: 'app-address-smart-input',
  templateUrl: './address-smart-input.component.html',
  styleUrls: ['./address-smart-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressSmartInputComponent {

  addresses$ = this.addressBookService.getAddressBookEntriesForAddress(
    this.preferenceQuery.getValue().address
  )

  confirmButtonLoadingSub = new BehaviorSubject(false)
  confirmButtonLoading$ = this.confirmButtonLoadingSub.asObservable()

  custmInputForm = new FormGroup({
    customAddressInput: new FormControl('', [Validators.required])
  })

  // @ViewChild('customAddressInput') customAddressInput!: ElementRef<InputEleme>

  @Input() selectedSub?: BehaviorSubject<string | null>

  constructor(private preferenceQuery: PreferenceQuery,
    private addressBookService: AddressBookService) { }

  myAddressClicked() {
     this.custmInputForm.controls
        .customAddressInput.setValue(this.preferenceQuery.getValue().address)
  }

  addressBookEntryClicked(address: string) {
    this.selectedSub?.next(address)
  }

  confirmAddressClicked() {
    let value: string = this.custmInputForm.controls.customAddressInput.value
    if(value.endsWith('.eth')) {
      this.confirmButtonLoadingSub.next(true)
      ethers.getDefaultProvider().resolveName(value).then(res => {
        this.confirmButtonLoadingSub.next(false)
        this.selectedSub?.next(res)
      })
    } else {
        this.confirmButtonLoadingSub.next(false)
        this.selectedSub?.next(value)
    }
  }


}
