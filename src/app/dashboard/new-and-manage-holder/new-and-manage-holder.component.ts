import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'app-new-and-manage-holder',
  templateUrl: './new-and-manage-holder.component.html',
  styleUrls: ['./new-and-manage-holder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewAndManageHolderComponent {

  selectedTabIndex = 0

  templateItems = [
    { type: "ERC-20", description: "The first fungible token standard, ERC20 is one of the most popular token types deployed on blockchains - securing >$100B in value."},
    { type: "NFT", description: "This is an NFT token, used by major NFT projects such as BAYC, CryptoPunks, ..."},
    { type: "ERC-1400", description: "This is the Security Token standard, providing a way to tokenize assets easily"}
  ]

  managedItems = [
    {
      name: "Loyalty Token -> Senegal FC",
      alias: "SENEGAL_LOYAL",
      custom: "SFC",
      createdDate: "22.6.2022"
    },
    {
      name: "Cry NFT #1",
      alias: "NFT1",
      custom: "NFT1",
      createdDate: "8.6.2022"
    }
  ]

  constructor() { }

  tabClicked(index: number) {
    this.selectedTabIndex = index
  }

}
