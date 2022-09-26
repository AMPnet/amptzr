import { animate, style, transition, trigger } from '@angular/animations'
import { Location } from '@angular/common'
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, filter, forkJoin, map, mergeMap, switchMap, tap, toArray } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { easeInOutAnimation } from 'src/app/shared/utils/animations'

@Component({
  selector: 'app-contracts-table-holder',
  templateUrl: './contracts-table-holder.component.html',
  styleUrls: ['./contracts-table-holder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: easeInOutAnimation
})
export class ContractsTableHolderComponent implements OnInit {

  @Input() templateItems: TemplateItemsModel[] = []
  @Input() manageItems: ManageItemsModel[] = []
  @Input() manageCustomFieldName: string = ''
  @Input() contractsListEmptyMessage: string = 'No contracts deployed'
  @Input() pendingContractsEmptyMessage: string = 'No pending contracts'
  activeTab: Tab = Tab.Manage
  tabType = Tab

  allContracts$ = this.contractService.getContractDeploymentRequests(this.projectService.projectID)
  
  refreshRequests$ = new BehaviorSubject<boolean>(true)
  pendingContractDeploymentRequests$ = this.refreshRequests$.pipe(
    switchMap(_ => this.contractService.getContractDeploymentRequests(this.projectService.projectID).pipe(
      map(contracts => contracts.requests.filter(contract => { return contract.status === 'PENDING' }))
    )))

  manifests$ = this.allContracts$.pipe(
    map(contracts => contracts.requests.filter(contract => contract.status === 'PENDING')),
    mergeMap(requests => {
      const manifests$ = requests.map(request => { return this.manifestService.getByID(request.contract_id) })
      return forkJoin(manifests$) }), tap(res => console.log("HERE")))

  deployedContracts$ = 
    this.contractService.getContractDeploymentRequests(this.projectService.projectID, true)
      .pipe(map(result => result.requests))

  deployableContracts$ = this.manifestService.getAll()
      .pipe(
        map((result) => { 
          return result.deployable_contracts.map(contract => {
            return {...contract, splitID: contract.id.split('.') }})}))

  importContractForm = new FormGroup({
    alias: new FormControl('', [Validators.required]),
    contractAddress: new FormControl('', [Validators.required]),
    contractManifest: new FormControl('', [])
  })


  constructor(private contractService: ContractDeploymentService,
    private manifestService: ContractManifestService,
    private preferenceQuery: PreferenceQuery,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private location: Location,
    private projectService: ProjectService) {}

  changeTab(tab: Tab) {
    this.activeTab = tab
  }

  importContractClicked() {
    return () => {
      const controls = this.importContractForm.controls
      const manifest: string = controls.contractManifest.value
      return this.contractService.importDeployedContract(controls.alias.value, 
        controls.contractAddress.value, manifest.length > 0 ? manifest : undefined).pipe(tap(_ => {
          this.dialogService.success({
            message: "You have successfully imported a smart contract"
          })
          this.changeTab(Tab.Manage)
        }))
    }
  }

  goBack() {
    this.location.back()
  }

  ngOnInit() {
      this.route.queryParams.subscribe(res => {
        if(res.screenConfig === 'requests') {
          this.changeTab(Tab.Pending)
        } else if(res.screenConfig === 'deploy') {
          this.changeTab(Tab.Add)
        } 
      })
    }

    refreshRequests() {
      this.refreshRequests$.next(true)
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