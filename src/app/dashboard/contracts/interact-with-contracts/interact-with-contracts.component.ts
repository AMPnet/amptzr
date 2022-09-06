import { Location } from '@angular/common'
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, from, map, Observable, switchMap, tap } from 'rxjs'
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
export class InteractWithContractsComponent {

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

  formFinishedLoadingSub = new BehaviorSubject(false)

  formGroups$: Observable<FormGroup[]> = this.contract$.pipe(
    map(result => {
      let groups: FormGroup[] = []

      result.functions.forEach(func => {
        let group = new FormGroup({})
        func.inputs.forEach((input, index) => { 
          group.addControl(index.toString(), new FormControl('')) 
        })
        groups.push(group)
      })

      return groups
    }),
    tap(_ => this.formFinishedLoadingSub.next(true))
  )

  deployedContract$ = this.deploymentService.getContractDeploymentRequest(this.contractDeploymentID)

  resultsBufferSub: BehaviorSubject<Map<string, string[]>> = new BehaviorSubject(new Map<string, string[]>())
  resultsBuffer$ = this.resultsBufferSub.asObservable()

  routeRoot = window.location.href.split("/")[0] 
    + "//" + window.location.href.split("/")[2]

  constructor(private manifestService: ContractManifestService,
    private deploymentService: ContractDeploymentService,
    private sessionQuery: SessionQuery,
    private location: Location,
    private preferenceQuery: PreferenceQuery,
    private route: ActivatedRoute
  ) { }

  setSelectedIndex(i: number) {
    if(this.selectedIndexSub.value !== i) {
      this.selectedIndexSub.next(i)
    } else {
      this.selectedIndexSub.next(-1)
    }
  }

  goBack() {
    this.location.back()
  }

  callContractFunction(func: FunctionManifest, group: FormGroup) {
    return () => {
      if(func.read_only) {
        return this.callReadOnlyFunction(func)
      } else  {
        return this.createWriteFunctionCallRequest(func, group)
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

  createWriteFunctionCallRequest(func: FunctionManifest, group: FormGroup) {
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
