import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core'
import { ControlValueAccessor } from '@angular/forms'
import { BehaviorSubject, first, map, Observable, skip, switchMap, tap } from 'rxjs'
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
export class SmartInputComponent implements ControlValueAccessor {

  contracts$ = this.contractsService.getContractDeploymentRequests(this.preferenceQuery.getValue().projectID, true)

  isDialogOpenSub = new BehaviorSubject(false)
  isDialogOpen$ = this.isDialogOpenSub.asObservable()
  @Input() inputIsArray = false

  onTouched: () => void = () => {}

  constructor(private contractsService: ContractDeploymentService,
    private preferenceQuery: PreferenceQuery) { }

  writeValue(obj: any): void {
    this.selectedSub.next(obj)
  }

  registerOnChange(fn: any): void {
    this.selected$.pipe(tap(res => fn(res)))
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  @Input() recommendedTypes: string[] = []
  @Input() inputType: InputType = "CONTRACT"

  inputs = [1,2,3,4,5,6,7,8,9,10]

  selectedSub = new BehaviorSubject<string | null>(null)
  selected$ = this.selectedSub.asObservable().pipe(
    skip(1),
    tap(() => this.isDialogOpenSub.next(false)),
    tap(_ => this.onTouched()))
  


  toggleInput() {
    this.isDialogOpenSub.next(!this.isDialogOpenSub.getValue())
  }

}

type InputType = "ADDRESS_BOOK" | "CONTRACT" | "DATE_TIME" | "DURATION" | "NUMBER"