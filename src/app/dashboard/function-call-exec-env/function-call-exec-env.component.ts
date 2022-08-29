import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { combineLatest, map, of, switchMap, zip } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'

@Component({
  selector: 'app-function-call-exec-env',
  templateUrl: './function-call-exec-env.component.html',
  styleUrls: ['./function-call-exec-env.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionCallExecEnvComponent {

  project$ = this.projectService.getProjectIdByChainAndAddress()
  issuer$ = this.issuerService.issuer$

  functionRequest$ = this.deploymentService
    .getFunctionCallRequest(this.route.snapshot.params.id)

  contract$ = this.functionRequest$
    .pipe(switchMap(result => this.deploymentService.getContractDeploymentRequest(result.deployed_contract_id)))

  manifest$ = this.contract$.pipe(
    switchMap(functionRequest => this.manifestService.getByID(functionRequest.contract_id))
  )

  functionManifest$ = zip(this.functionRequest$, this.manifest$).pipe(
    map(result => {
      return result[1].functions.filter(func => { return func.solidity_name === result[0].function_name })
    })
  )

  constructor(private projectService: ProjectService,
    private issuerService: IssuerService,
    private route: ActivatedRoute,
    private manifestService: ContractManifestService,
    private deploymentService: ContractDeploymentService) { }

}
