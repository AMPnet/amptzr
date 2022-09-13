import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core'
import { AbstractControl, ControlValueAccessor, FormControl, FormGroup } from '@angular/forms'
import flatpickr from 'flatpickr'
import { BehaviorSubject, delay, first, map, Observable, of, skip, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { ContractManifestService, FunctionManifest, ParamsManifest } from '../../services/backend/contract-manifest.service'
import { ProjectService } from '../../services/backend/project.service'
import { ContractDeploymentRequestResponse, ContractDeploymentRequests, ContractDeploymentService } from '../../services/blockchain/contract-deployment.service'
import { SmartInputDisplayService } from './smart-input-display.service'
import 'tw-elements'

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

  @ViewChild('smartInputElement') smartInputElement!: ElementRef

  onTouched: () => void = () => {}

  picker: any

  @Input() recommendedTypes: string[] = []
  @Input() rootForm!: FormGroup
  @Input() controlName!: string
  inputType: InputType = "TEXT"

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
    this.inputType = this.generateInternalInputType(this.solidityType, this.recommendedTypes)
  }

  generateInternalInputType(solidityType: string, recommendedTypes: string[]): InputType {
    if(solidityType === 'address') {
      return this.interpretAddressType(recommendedTypes)
    } else if(solidityType.startsWith('uint')) {
      return this.interpretNumberType(recommendedTypes)
    } else if(solidityType.startsWith('bool')) {
      return "BOOLEAN"
    } else if(solidityType.startsWith('bytes')) {
      return "ARRAY"
    } else if(solidityType.startsWith('string')) {
      return "TEXT"
    } else {
      return "TEXT"
    }
  }

  interpretAddressType(recommendedTypes: string[]): InputType {
    const isContractCaller = recommendedTypes.some(res => res.startsWith('traits.contractCaller'))
    if(isContractCaller) { return "ADDRESS_BOOK" }
    
    const isContract = recommendedTypes.some(res => res.startsWith('traits.'))
    return isContract ? "CONTRACT" : "ADDRESS_BOOK"
  }

  interpretNumberType(recommendedTypes: string[]): InputType {
    const hasType = recommendedTypes.some(res => res.startsWith('types.'))
    if(!hasType) { return "TEXT" }
    const type = recommendedTypes[0] as ManifestTypeOptions
    if(type === "types.unixTimestamp") {
      return "DATE_TIME"
    } else if(type === "types.durationSeconds") {
      return "DURATION"
    } else {
      return "TEXT"
    }
  }
  
  controlAsForm(name: string) {
    return this.rootForm.controls[name] as FormControl
  }

  toggleInput() {
    if(this.inputType === 'DATE_TIME') { 
      return 
    }
    if((this.inputType !== "TEXT")) {
      this.isDialogOpenSub.next(!this.isDialogOpenSub.getValue())
    }

  }

}

type InputType = "TEXT" | "ADDRESS_BOOK" | "CONTRACT" | "DATE_TIME" | "DURATION" | "NUMBER" | "BOOLEAN" | "ARRAY" | "CONTRACT CALLER"
type ManifestTypeOptions = "types.unixTimestamp" | "types.durationSeconds"