import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { boolean } from 'hardhat/internal/core/params/argumentTypes'
import { BehaviorSubject, combineLatest, delay, from, map, Observable, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { FunctionManifest } from 'src/app/shared/services/backend/contract-manifest.service'
import { ContractDeploymentService, FunctionArgumentType, ReadOnlyFunctionResponse } from 'src/app/shared/services/blockchain/contract-deployment.service'

@Component({
  selector: 'app-contract-function-interaction-item',
  templateUrl: './contract-function-interaction-item.component.html',
  styleUrls: ['./contract-function-interaction-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFunctionInteractionItemComponent implements OnInit {

  @Input() functionManifest!: FunctionManifest
  @Input() contractID!: string
  
  isSelectedSub = new BehaviorSubject(false)
  isSelected$ = this.isSelectedSub.asObservable()

  txCopyLabelSub = new BehaviorSubject("Copy to clipboard")
  txCopyLabel$ = this.txCopyLabelSub.asObservable()

  form = new FormGroup({})

  formFinishedSub = new BehaviorSubject(false)

  resultSub = new BehaviorSubject<ReadOnlyFunctionResponse | null>(null)
  result$ = this.resultSub.asObservable()

  structResult$ = this.result$.pipe(
    map(res => {
      if(res?.output_params?.at(0)?.type !== undefined) {
        return res?.return_values.at(0)
      } else { return null }
    })
  )

  primitiveResult$ = this.result$.pipe(
    map(res => {
      if(res?.output_params?.at(0)?.type === undefined) {
        return res?.return_values
      } else { return null }
    })
  )

  writeResultSub = new BehaviorSubject<string | undefined>(undefined)
  writeResult$ = this.writeResultSub.asObservable()

  hasResult$ : Observable<boolean> = combineLatest([this.structResult$, this.primitiveResult$, this.writeResult$]).pipe(
    map(([s,p,w]) => {
      return Boolean(s) || Boolean(p) || Boolean(w)
    })
  )

  constructor(private deploymentService: ContractDeploymentService,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery) {     
  }

  ngOnInit(): void {
    this.functionManifest.inputs.forEach(input => {
      this.form.addControl(input.solidity_name, new FormControl('', [Validators.required]))
    })
    this.formFinishedSub.next(true)
  }

  toggle() {
    this.isSelectedSub.next(!this.isSelectedSub.value)
  }
  
  invalidateResult() {
    this.resultSub.next(null)
    this.writeResultSub.next(undefined)
  }

  copyToClipboard(result: string) {
    navigator.clipboard.writeText(result)
    this.txCopyLabelSub.next("Copied")
    setTimeout(() => { this.txCopyLabelSub.next("Copy to clipboard")  }, 500)
  }

  executeReadFunction() {
    return () => {
      let outputParams: string[] | { type: string, elems: string[] }[] = []
      if(this.functionManifest.outputs.at(0)?.solidity_type === 'tuple[]') {
        outputParams = [{
          type: 'tuple[]',
          elems: this.functionManifest.outputs[0].parameters!.map(param => param.solidity_type)
        }]
      } else {
        outputParams = this.functionManifest.outputs.map(out => out.solidity_type)
      }

      return from(this.sessionQuery.provider.getBlockNumber()).pipe(
        switchMap(blockNumber => {
          return this.deploymentService.callReadOnlyFunction(this.contractID, {
            block_number: blockNumber,
            caller_address: this.preferenceQuery.getValue().address,
            function_name: this.functionManifest.solidity_name,
            function_params: this.functionManifest.inputs.map(input => {
              return { type: input.solidity_type as FunctionArgumentType, value: this.form.get(input.solidity_name)?.value }
            }),
            output_params: outputParams
          })
        }), tap(result => {
          this.resultSub.next(result)
        })
      )
    }
  }

  executeWriteFunction() {
    return () => {
      return this.deploymentService.createWriteFunctionCallRequest(this.contractID, {
        eth_amount: 0,
        function_name: this.functionManifest.solidity_name,
        function_params: this.functionManifest.inputs.map(input => { 
          return { type: input.solidity_type as FunctionArgumentType, value: this.form.get(input.solidity_name)?.value } 
        })
      }).pipe(tap(result => this.writeResultSub.next(result.redirect_url) ))
    }
  }

}

export type ResultType = PrimitiveResultContainer | StructResultContainer

type PrimitiveResultContainer  = { kind: "primitive", value: string[] }
type StructResultContainer = { kind: "struct", value: string[][] }

