import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { BehaviorSubject, Observable, switchMap } from 'rxjs'
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

  openTabSub = new BehaviorSubject<Tab>("MY_CONTRACTS")
  openTab$ = this.openTabSub.asObservable()

  @Input() selectedSub?: BehaviorSubject<ContractDeploymentRequestResponse | null>

  constructor(private projectService: ProjectService, 
    private contractsService: ContractDeploymentService,
    private smartInputDisplayService: SmartInputDisplayService) { }

  isOpenTab(tabName: Tab) {
    return tabName === this.openTabSub.getValue()
  }

  selectItem(item: ContractDeploymentRequestResponse) {
    this.selectedSub?.next(item)
  }

}

type Tab = "MY_CONTRACTS" | "EXTERNAL" | "CUSTOM"
