import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core'
import { BehaviorSubject, map, Observable, skip, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { ContractManifestService, FunctionManifest, ParamsManifest } from '../../services/backend/contract-manifest.service'
import { ProjectService } from '../../services/backend/project.service'
import { ContractDeploymentRequestResponse, ContractDeploymentRequests, ContractDeploymentService } from '../../services/blockchain/contract-deployment.service'
import { SmartInputDisplayService } from './smart-input-display.service'

@Component({
  selector: 'app-smart-input',
  templateUrl: './smart-input.component.html',
  styleUrls: ['./smart-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartInputComponent {

  contracts$ = this.contractsService.getContractDeploymentRequests(this.preferenceQuery.getValue().projectID, true)

  isDialogOpenSub = new BehaviorSubject(false)
  isDialogOpen$ = this.isDialogOpenSub.asObservable()
  @Input() inputIsArray = false

  constructor(private contractsService: ContractDeploymentService,
    private preferenceQuery: PreferenceQuery) { }

  @Input() recommendedTypes: string[] = []
  @Input() inputType: InputType = "CONTRACT"

  inputs = [1,2,3,4,5,6,7,8,9,10]

  selectedSub = new BehaviorSubject<string | null>(null)
  selected$ = this.selectedSub.asObservable().pipe(
    skip(1),
    tap(() => this.isDialogOpenSub.next(false)))

  toggleInput() {
    this.isDialogOpenSub.next(!this.isDialogOpenSub.getValue())
  }

}

type InputType = "ADDRESS_BOOK" | "CONTRACT" | "DATE_TIME" | "DURATION" | "NUMBER"