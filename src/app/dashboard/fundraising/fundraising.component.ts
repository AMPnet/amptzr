import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import {
  ManageItemsModel,
  TemplateItemsModel,
} from '../new-and-manage-holder/new-and-manage-holder.component'

@Component({
  selector: 'app-fundraising',
  templateUrl: './fundraising.component.html',
  styleUrls: ['./fundraising.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundraisingComponent {
  templateItems: TemplateItemsModel[] = [
    {
      type: 'Crowdfunding',
      description: 'This is the standard crowdfunding contract',
      actions: [
        {
          title: 'Create',
          url: '0xc8DE93A65a94d3cBBDaa0D7ACBF803A810fd0635/campaigns/new',
          icon: ``,
        },
        {
          title: 'Import',
          url: '../import/crowdfunding',
          icon: ``,
        },
      ],
    },
  ]

  manageItems: ManageItemsModel[] = [
    {
      name: 'Fundraising VATRENI token',
      custom: '$12.3M',
      alias: 'VATRENI_CAMPAIGN',
      createdDate: '27.1.2022',
    },
  ]

  constructor() {}
}
