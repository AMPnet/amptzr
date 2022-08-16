import { Location } from '@angular/common'
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { filter, map, switchMap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'

@Component({
  selector: 'app-new-and-manage-holder',
  templateUrl: './new-and-manage-holder.component.html',
  styleUrls: ['./new-and-manage-holder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewAndManageHolderComponent implements OnInit {

  @Input() templateItems: TemplateItemsModel[] = []
  @Input() manageItems: ManageItemsModel[] = []
  @Input() manageCustomFieldName: string = ''
  @Input() contractsListEmptyMessage: string = 'No contracts deployed'
  @Input() pendingContractsEmptyMessage: string = 'No pending contracts'
  activeTab: Tab = Tab.Manage
  tabType = Tab

  allContracts$ = this.projectService
    .getProjectIdByChainAndAddress().pipe(
      switchMap(project => this.contractService.getContractDeploymentRequests(project.id)),
    )

  pendingContractDeploymentRequests$ = this.allContracts$
      .pipe(map(result => result.requests.filter(x => x.status === 'PENDING')))

  deployedContracts$ = this.allContracts$
        .pipe(map(result => result.requests.filter(x => x.status === 'SUCCESS')))

  deployableContracts$ = this.manifestService.getAll()
      .pipe(
        map((result) => { 
          return result.deployable_contracts.map(contract => {
            return {...contract, splitID: contract.id.split('.'), description:"abc" }
          })
        })
  )

  constructor(private contractService: ContractDeploymentService,
    private manifestService: ContractManifestService,
    private preferenceQuery: PreferenceQuery,
    private route: ActivatedRoute,
    private location: Location,
    private projectService: ProjectService) {}

  changeTab(tab: Tab) {
    this.activeTab = tab
  }

  goBack() {
    this.location.back()
  }

  ngOnInit() {
      this.route.queryParams.subscribe(res => {
        if(res.screenConfig === 'requests') {
          this.changeTab(Tab.Pending)
        }
      })
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