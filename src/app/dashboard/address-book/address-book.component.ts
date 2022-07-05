import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressBookComponent implements OnInit {

  addresses: AddressModel[] = [
    {
      address: "0x40dbE1593C62808BCf9C5FbaefA0AD5De827416f",
      alias: "Mislav Ledger"
    },
    {
      address: "0x40dbE1593C62808BCf9C5FbaefA0AD5De827416f",
      alias: "Filip MetaMask"
    }
  ]
  selectedTabIndex = 0

  constructor() { }

  ngOnInit(): void {
  }

  tabClicked(index: number) {
    this.selectedTabIndex = index;
  }

}

interface AddressModel {
  address: string,
  alias: string
}
