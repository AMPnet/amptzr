import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core'
import { AbstractControl, ControlValueAccessor, FormControl, FormGroup } from '@angular/forms'
import flatpickr from 'flatpickr'
import { BehaviorSubject, delay, first, from, map, Observable, of, skip, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { ContractManifestService, FunctionManifest, ParamsManifest } from '../../services/backend/contract-manifest.service'
import { ProjectService } from '../../services/backend/project.service'
import { ContractDeploymentRequestResponse, ContractDeploymentRequests, ContractDeploymentService } from '../../services/blockchain/contract-deployment.service'
import { SmartInputDisplayService } from './smart-input-display.service'
import 'tw-elements'
import { Dev3SDK} from "dev3-sdk"
import { easeInOutAnimation } from '../../utils/animations'

@Component({
  selector: 'app-smart-input',
  templateUrl: './smart-input.component.html',
  styleUrls: ['./smart-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: easeInOutAnimation
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

  arraySubtype: InputType = "TEXT"
  arrayBufferSub = new BehaviorSubject<string[]>([])
  arrayBuffer$ = this.arrayBufferSub.asObservable()

  selectedSub = new BehaviorSubject<string | null>(null)
  selected$ = this.selectedSub.asObservable().pipe(
    tap(() => this.isDialogOpenSub.next(false)),
    tap((result) => { 
      if(this.inputType === 'ARRAY') {
        this.arrayBufferForm.controls.arrayBufferInput.setValue(result)
      } else {
        this.rootForm.get(this.controlName)?.setValue(result) 
      }
    }),
    tap(_ => this.onTouched()))

  arrayBufferForm = new FormGroup({
    arrayBufferInput: new FormControl('', [])
  })

  constructor(private contractsService: ContractDeploymentService,
    private preferenceQuery: PreferenceQuery) { }

  ngOnInit(): void {

    this.formFinishedLoading$ = this.formFinishedLoadingSub.asObservable()
    this.formFinishedLoading$.pipe(tap(_ => console.log(this.rootForm)))
    this.inputType = this.generateInternalInputType(this.solidityType, this.recommendedTypes)

    if(this.inputType === 'DATE_TIME') { this.handleDateTime() }
  }

  newValue(event: Event) {
    const dateString: string = (event.target as any).value
    let date = new Date(dateString)
    const unixSeconds = Math.floor(date.valueOf() / 1000)
    this.rootForm.controls[this.controlName].setValue(unixSeconds)
  }

  handleDateTime() {
    
  }

  addToArrayBuffer() {
    let bufferValue = this.arrayBufferSub.getValue()
    bufferValue.unshift(this.arrayBufferForm.controls.arrayBufferInput.value)
    this.arrayBufferSub.next(bufferValue)
    this.arrayBufferForm.controls.arrayBufferInput.setValue('')

    this.rootForm.get(this.controlName)?.setValue(this.arrayBufferSub.getValue())
  }

  removeFromArrayBuffer(i: number) {
    let bufferValue = this.arrayBufferSub.getValue().filter((_, index) => { return index !== i })
    this.arrayBufferSub.next(bufferValue)
  }

  generateInternalInputType(solidityType: string, recommendedTypes: string[]): InputType {
    if(solidityType.endsWith('[]')) {
      this.arraySubtype = this.generateInternalInputType(solidityType.replace('[]', ''), recommendedTypes)
      return "ARRAY"
    } else if(solidityType === 'address') {
      return this.interpretAddressType(recommendedTypes)
    } else if(solidityType.startsWith('uint')) {
      return this.interpretNumberType(recommendedTypes)
    } else if(solidityType.startsWith('bool')) {
      return "BOOLEAN"
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
    if(this.inputType === 'ARRAY') {
      this.handleArrayToggle()
      return
    }
    if(this.inputType === 'DATE_TIME') { 
      return 
    }
    if((this.inputType !== "TEXT")) {
      this.isDialogOpenSub.next(!this.isDialogOpenSub.getValue())
    }
  }

  handleArrayToggle() {
    if(this.arraySubtype !== 'TEXT') {
      this.isDialogOpenSub.next(!this.isDialogOpenSub.getValue())
    }
  }

  inputTypeOrArraySubtypeIs(type: InputType) {
    return (this.inputType === type) || (this.arraySubtype === type)
  }

}

type InputType = "TEXT" | "ADDRESS_BOOK" | "CONTRACT" | "DATE_TIME" | "DURATION" | "NUMBER" | "BOOLEAN" | "ARRAY" | "CONTRACT CALLER"
type ManifestTypeOptions = "types.unixTimestamp" | "types.durationSeconds"