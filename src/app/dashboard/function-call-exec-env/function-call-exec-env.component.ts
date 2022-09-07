import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, combineLatest, delay, map, of, switchMap, tap, zip } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { BackendHttpClient } from 'src/app/shared/services/backend/backend-http-client.service'
import { ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { ContractDeploymentService, FunctionCallRequestResponse } from 'src/app/shared/services/blockchain/contract-deployment.service'
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

  isWaitingForTxSub = new BehaviorSubject(false)
  isWaitingForTx$ = this.isWaitingForTxSub.asObservable()

  functionRequest$ = this.deploymentService
    .getFunctionCallRequest(this.route.snapshot.params.id).pipe(tap(res => console.log(res)))

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

  executeFunction(functionDeploymentRequest: FunctionCallRequestResponse) {
    return () => {
      return this.deploymentService.executeFunction(functionDeploymentRequest).pipe(
        tap(() => { this.isWaitingForTxSub.next(true) }),
        switchMap(result => this.sessionQuery.provider.waitForTransaction(result.hash)),
        switchMap(result => this.deploymentService.attachTxInfoToRequest(
          functionDeploymentRequest.id,
          result.transactionHash,
          this.preferenceQuery.getValue().address,
          "TRANSACTION"
        )),
        delay(1000),
        tap(() => {
          this.functionRequest$ = this.deploymentService
            .getFunctionCallRequest(this.route.snapshot.params.id)
          this.isWaitingForTxSub.next(false)
        })
      )
    }
  }


  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  constructor(
    private issuerService: IssuerService,
    private route: ActivatedRoute,
    private signerService: SignerService,
    private preferenceQuery: PreferenceQuery,
    private sessionQuery: SessionQuery,
    private manifestService: ContractManifestService,
    private deploymentService: ContractDeploymentService) { }

}
