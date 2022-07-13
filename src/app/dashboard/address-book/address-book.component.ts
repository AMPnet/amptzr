import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressBookComponent {

  addresses: AddressModel[] = [
    {
      address: "0x40dbE1593C62808BCf9C5FbaefA0AD5De827416f",
      alias: "Mislav Ledger",
      phone: "+385 95 354 6106",
      email: "mislav@ampnet.io"
    },
    {
      address: "0x40dbE1593C62808BCf9C5FbaefA0AD5De827416f",
      alias: "Filip MetaMask",
      phone: "",
      email: "filip@ampnet.io"
    }
  ]
  activeTab = TabType.AddressBook
  Tab = TabType

  constructor() { }

  tabClicked(tab: TabType) {
    this.activeTab = tab
  }

}

interface AddressModel {
  address: string,
  alias: string
  phone: string,
  email: string
}

enum TabType {
  AddressBook,
  Add
}