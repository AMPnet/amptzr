import { Component, ChangeDetectionStrategy, Input } from '@angular/core'
import { filter, map, switchMap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'

@Component({
  selector: 'app-new-and-manage-holder',
  templateUrl: './new-and-manage-holder.component.html',
  styleUrls: ['./new-and-manage-holder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewAndManageHolderComponent {

  @Input() templateItems: TemplateItemsModel[] = []
  @Input() manageItems: ManageItemsModel[] = []
  @Input() manageCustomFieldName: string = ''
  @Input() contractsListEmptyMessage: string = 'No contracts deployed'
  @Input() pendingContractsEmptyMessage: string = 'No pending contracts'
  activeTab: Tab = Tab.Manage
  tabType = Tab

  pendingContractDeploymentRequests$ = this.projectService
  .getProjectIdByChainAndAddress().pipe(
    switchMap(project => this.contractService.getContractDeploymentRequests(project.id)),
    map(result => result.requests.filter(x => x.status === 'PENDING')),
  )

  deployedContracts$ = this.projectService
  .getProjectIdByChainAndAddress().pipe(
    switchMap(project => this.contractService.getContractDeploymentRequests(project.id)),
    map(result => result.requests.filter(x => x.status === 'FINALIZED')),
  )

  constructor(private contractService: ContractDeploymentService,
    private preferenceQuery: PreferenceQuery,
    private projectService: ProjectService) {}

  changeTab(tab: Tab) {
    this.activeTab = tab
  }
}

enum Tab {
  Manage,
  Pending,
  Add,
  Import
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

export interface RequestsItemsModel {
  id: string,
  type: string,
  publicUrl: string
}