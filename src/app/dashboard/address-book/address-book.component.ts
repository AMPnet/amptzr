import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { map, Observable, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { AddressBookResponseData, AddressBookResponseDataEntries, AddressBookService } from './address-book.service'

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressBookComponent {
  
  addresses$ = this.fetchAddresses()

  addressBookEntryForm = new FormGroup({
    wallet: new FormControl('', [Validators.required]),
    alias: new FormControl('', [Validators.required]),
    phone: new FormControl('', []),
    email: new FormControl('', [])
  })

  activeTab = TabType.AddressBook
  Tab = TabType

  addEntryClicked() {
    return () => {
      const addressBookControls = this.addressBookEntryForm.controls
      return this.addressBookService.addAddressBookEntry(
        addressBookControls.alias.value,
        addressBookControls.wallet.value,
        addressBookControls.phone.value,
        addressBookControls.email.value
      ).pipe(tap(_ => { 
        this.activeTab = TabType.AddressBook
        this.addresses$ = this.fetchAddresses()
      }))
    }
  }

  fetchAddresses(): Observable<AddressBookResponseDataEntries> {
    return this.addressBookService.getAddressBookEntriesForAddress(
      this.preferenceQuery.getValue().address
    )
  }

  deleteAddressBookEntry(id: string) {
    return () => {
      return this.addressBookService.deleteAddressBookEntryByID(id).pipe(tap(_=> {
        this.activeTab = TabType.AddressBook
        this.addresses$ = this.fetchAddresses()
      }))
    }
  }

  constructor(private addressBookService: AddressBookService,
    private preferenceQuery: PreferenceQuery) {}

  tabClicked(tab: TabType) {
    this.activeTab = tab
  }
}

enum TabType {
  AddressBook,
  Add,
}
