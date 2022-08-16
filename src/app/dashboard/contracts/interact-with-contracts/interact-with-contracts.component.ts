import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, from, map, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { ContractManifestService, FunctionManifest } from 'src/app/shared/services/backend/contract-manifest.service'
import { ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'

@Component({
  selector: 'app-interact-with-contracts',
  templateUrl: './interact-with-contracts.component.html',
  styleUrls: ['./interact-with-contracts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractWithContractsComponent implements OnInit {

  contractManifestID = this.route.snapshot.params.manifestID
  contractDeploymentID = this.route.snapshot.params.deployedID

  selectedIndexSub = new BehaviorSubject(-1)
  selectedIndex$ = this.selectedIndexSub.asObservable()

  contract$ = this.manifestService.getByID(this.contractManifestID).pipe(
    map((result) => {
      let sortedFunctions = result.functions.sort((a, b) => { return a.inputs.length - b.inputs.length })
      return { ...result, functions: sortedFunctions }
    })
  )

  deployedContract$ = this.deploymentService.getContractDeploymentRequest(this.contractDeploymentID)

  resultsBufferSub: BehaviorSubject<Map<string, string[]>> = new BehaviorSubject(new Map<string, string[]>())
  resultsBuffer$ = this.resultsBufferSub.asObservable()

  constructor(private manifestService: ContractManifestService,
    private deploymentService: ContractDeploymentService,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  setSelectedIndex(i: number) {
    if(this.selectedIndexSub.value !== i) {
      this.selectedIndexSub.next(i)
    } else {
      this.selectedIndexSub.next(-1)
    }
  }

  callContractFunction(func: FunctionManifest) {
    return () => {
      if(func.read_only) {
        return this.callReadOnlyFunction(func)
      } else  {
        return this.createWriteFunctionCallRequest(func)
      }
    }
  }

  callReadOnlyFunction(func: FunctionManifest) {
    return from(this.sessionQuery.provider.getBlockNumber()).pipe(
      switchMap(blockNumber => {
        return this.deploymentService.callReadOnlyFunction(this.contractDeploymentID, {
          block_number: blockNumber,
          function_name: func.solidity_name,
          function_params: [],
          output_params: func.outputs.map(x => x.solidity_type),
          caller_address: this.preferenceQuery.getValue().address
        }).pipe(tap((res) => {
          this.resultsBufferSub.next(
            this.resultsBufferSub.getValue().set(func.solidity_name, res.return_values)
          )
        }))
      })
    )
  }

  createWriteFunctionCallRequest(func: FunctionManifest) {
    
      return this.deploymentService.createWriteFunctionCallRequest(this.contractDeploymentID, {
        eth_amount: 0,
        function_name: func.solidity_name,
        function_params: []
      }).pipe(tap((res) => {
        this.resultsBufferSub.next(
          this.resultsBufferSub.getValue().set(func.solidity_name, [res.redirect_url])
        )
      }))
      
  }

}
