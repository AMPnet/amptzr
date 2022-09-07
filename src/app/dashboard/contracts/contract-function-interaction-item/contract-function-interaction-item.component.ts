import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { BehaviorSubject, from, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { FunctionManifest } from 'src/app/shared/services/backend/contract-manifest.service'
import { ContractDeploymentService, FunctionArgumentType } from 'src/app/shared/services/blockchain/contract-deployment.service'

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

  form = new FormGroup({})

  formFinishedSub = new BehaviorSubject(false)

  resultSub = new BehaviorSubject<ResultType | undefined>(undefined)
  result$ = this.resultSub.asObservable()

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

  executeReadFunction() {
    return () => {
      return from(this.sessionQuery.provider.getBlockNumber()).pipe(
        switchMap(blockNumber => {
          return this.deploymentService.callReadOnlyFunction(this.contractID, {
            block_number: blockNumber,
            caller_address: this.preferenceQuery.getValue().address,
            function_name: this.functionManifest.solidity_name,
            function_params: this.functionManifest.inputs.map(input => {
              return { type: input.solidity_type as FunctionArgumentType, value: this.form.get(input.solidity_name)?.value }
            }),
            output_params: this.functionManifest.outputs.map(output => output.solidity_type)
          })
        }), tap(result => { this.resultSub.next({ readOnly: true, result: result.return_values }) })
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
      }).pipe(tap(result => { this.resultSub.next({ readOnly: false, result: [result.redirect_url] }) }))
    }
  }

}

type ResultType = { readOnly: boolean, result: string[] }