import { Component, ChangeDetectionStrategy } from '@angular/core'
import {
  ManageItemsModel,
  TemplateItemsModel,
} from '../../new-and-manage-holder/new-and-manage-holder.component'

@Component({
  selector: 'app-tokens-holder',
  templateUrl: './tokens-holder.component.html',
  styleUrls: ['./tokens-holder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokensHolderComponent {
  templateItems: TemplateItemsModel[] = [
    {
      type: 'ERC-20',
      description:
        'The first fungible token standard, ERC20 is one of the most popular token types deployed on blockchains - securing >$100B in value.',
      actions: [
        {
          title: 'Create',
          url: 'create/erc20',
          icon: ``,
        },
        {
          title: 'Import',
          url: 'import/erc20',
          icon: ``,
        },
      ],
    }
  ]

  manageItems: ManageItemsModel[] = [
   
  ]

  constructor() {}
}
