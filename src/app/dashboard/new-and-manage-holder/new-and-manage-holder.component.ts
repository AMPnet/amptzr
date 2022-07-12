import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core'
import { Action } from 'rxjs/internal/scheduler/Action'

@Component({
  selector: 'app-new-and-manage-holder',
  templateUrl: './new-and-manage-holder.component.html',
  styleUrls: ['./new-and-manage-holder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewAndManageHolderComponent {
  selectedTabIndex = 0

  @Input() templateItems: TemplateItemsModel[] = []
  @Input() manageItems: ManageItemsModel[] = []
  @Input() manageCustomFieldName: string = ''

  constructor() {}

  tabClicked(index: number) {
    this.selectedTabIndex = index
  }
}

export interface TemplateItemsModel {
  type: string
  description: string
  actions: ActionModel[]
}

export interface ActionModel {
  title: string
  url: string
  icon: string
}

export interface ManageItemsModel {
  name: string
  alias: string
  custom: string
  createdDate: string
}
