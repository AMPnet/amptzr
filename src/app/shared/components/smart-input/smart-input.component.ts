import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core'
import { AbstractControl, ControlValueAccessor, FormControl, FormGroup } from '@angular/forms'
import { BehaviorSubject, delay, first, map, Observable, of, skip, switchMap, tap } from 'rxjs'
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
export class SmartInputComponent implements OnInit {

  contracts$ = this.contractsService.getContractDeploymentRequests(this.preferenceQuery.getValue().projectID, true)
  isDialogOpenSub = new BehaviorSubject(false)
  isDialogOpen$ = this.isDialogOpenSub.asObservable()

  @Input() inputIsArray = false
  @Input() formFinishedLoadingSub!: BehaviorSubject<boolean>
  formFinishedLoading$!: Observable<boolean>
  @Input() solidityType!: string

  onTouched: () => void = () => {}

  @Input() recommendedTypes: string[] = []
  inputType: InputType = "CONTRACT"
  @Input() rootForm!: FormGroup
  @Input() controlName!: string

  selectedSub = new BehaviorSubject<string | null>(null)
  selected$ = this.selectedSub.asObservable().pipe(
    tap(() => this.isDialogOpenSub.next(false)),
    tap((result) => { 
      this.rootForm.get(this.controlName)?.setValue(result) 
    }),
    tap(_ => this.onTouched()))

  constructor(private contractsService: ContractDeploymentService,
    private preferenceQuery: PreferenceQuery) { }

  ngOnInit(): void {
    this.formFinishedLoading$ = this.formFinishedLoadingSub.asObservable()
    this.formFinishedLoading$.pipe(tap(_ => console.log(this.rootForm)))
    this.inputType = this.convertSolidityTypeToInternalType(this.solidityType)
  }

  convertSolidityTypeToInternalType(solidityType: string): InputType {
    return "TEXT"
  }
  
  controlAsForm(name: string) {
    return this.rootForm.controls[name] as FormControl
  }

  toggleInput() {
    if(this.inputType !== "TEXT") {
      this.isDialogOpenSub.next(!this.isDialogOpenSub.getValue())
    }
  }

}

type InputType = "TEXT" | "ADDRESS_BOOK" | "CONTRACT" | "DATE_TIME" | "DURATION" | "NUMBER"