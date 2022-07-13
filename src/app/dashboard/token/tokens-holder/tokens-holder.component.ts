import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ManageItemsModel, TemplateItemsModel } from '../../new-and-manage-holder/new-and-manage-holder.component'

@Component({
  selector: 'app-tokens-holder',
  templateUrl: './tokens-holder.component.html',
  styleUrls: ['./tokens-holder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensHolderComponent {

  templateItems: TemplateItemsModel[] = [
    { 
      type: "ERC-20", 
      description: "The first fungible token standard, ERC20 is one of the most popular token types deployed on blockchains - securing >$100B in value.",
      actions: [
        {
          title: "Create",
          url: "create/erc20",
          icon: ``
        },
        {
          title: "Import",
          url: "import/erc20",
          icon: ``
        }
      ]
    },
    { 
      type: "ERC-721 (NFT)", 
      description: "This is an NFT token, used by major NFT projects such as BAYC, CryptoPunks, ...",
      actions: [
        {
          title: "Create",
          url: "create/erc721",
          icon: ``
        },
        { 
          title: "Import",
          url: "import/erc721",
          icon: ``
        }
      ]
    },
    { 
      type: "ERC-1400 (Security)", 
      description: "This is the Security Token standard, providing a way to tokenize assets easily",
      actions: [
        {
          title: "Create",
          url: "create/erc1400",
          icon: ``
        },
        {
          title: "Import",
          url: "import/erc1400",
          icon: ``
        }
      ]
    }
  ]

  manageItems: ManageItemsModel[] = [
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

}
