import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { combineLatest, map, of, switchMap, zip } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { BackendHttpClient } from 'src/app/shared/services/backend/backend-http-client.service'
import { ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'
import { SignerService } from 'src/app/shared/services/signer.service'
import { UserService } from 'src/app/shared/services/user.service'

@Component({
  selector: 'app-function-call-exec-env',
  templateUrl: './function-call-exec-env.component.html',
  styleUrls: ['./function-call-exec-env.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionCallExecEnvComponent {

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

  login() {
    return this.signerService.ensureAuth
  }

  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  constructor(
    private issuerService: IssuerService,
    private route: ActivatedRoute,
    private signerService: SignerService,
    private sessionQuery: SessionQuery,
    private manifestService: ContractManifestService,
    private deploymentService: ContractDeploymentService) { }

}
