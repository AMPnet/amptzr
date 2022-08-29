import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { BehaviorSubject, forkJoin, map, mergeMap, Observable, switchMap } from 'rxjs'
import { ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { ContractDeploymentRequestResponse, ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { SmartInputDisplayService } from '../smart-input-display.service'

@Component({
  selector: 'app-contract-smart-input',
  templateUrl: './contract-smart-input.component.html',
  styleUrls: ['./contract-smart-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractSmartInputComponent {

  contracts$ = this.projectService.getProjectIdByChainAndAddress().pipe(
    switchMap(result => this.contractsService.getContractDeploymentRequests(result.id, true)))

  manifests$ = this.contracts$.pipe(
    map(contracts => contracts.requests),
    mergeMap(request => {
      const manifests = request.map(req => this.manifestService.getByID(req.contract_id))
      return forkJoin(manifests)}))

  openTabSub = new BehaviorSubject<Tab>("MY_CONTRACTS")
  openTab$ = this.openTabSub.asObservable()

  @Input() selectedSub?: BehaviorSubject<string | null>

  constructor(private projectService: ProjectService, 
    private contractsService: ContractDeploymentService,
    private manifestService: ContractManifestService,
    private smartInputDisplayService: SmartInputDisplayService) { }

  isOpenTab(tabName: Tab) {
    return tabName === this.openTabSub.getValue()
  }

  selectItem(item: ContractDeploymentRequestResponse) {
    this.selectedSub?.next(item.contract_address)
  }

}

type Tab = "MY_CONTRACTS" | "EXTERNAL" | "CUSTOM"
