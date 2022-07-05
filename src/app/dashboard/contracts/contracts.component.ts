import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ManageItemsModel, TemplateItemsModel } from '../new-and-manage-holder/new-and-manage-holder.component';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsComponent implements OnInit {

  templateItems: TemplateItemsModel[] = [
    {
      type: "VESTING",
      description: "This is a vesting contract, enabling the vesting of ERC-20 tokens",
      actions: [
        {
          title: "Create",
          url: "create",
          icon: ``
        },
        {
          title: "Import",
          url: "import",
          icon: ``
        }
      ]
    }
  ]

  manageItems: ManageItemsModel[] = [
    {
      name: "Vatreni vesting",
      alias: "VATRENI_VESTING",
      custom: "openzeppelin.vesting",
      createdDate: "27.4.2022"
    }
  ]
 
  constructor() { }

  ngOnInit(): void {
  }

}
