import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, delay, from, merge, of, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'
import { ContractDeploymentRequests, ContractDeploymentRequestResponse, ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { GasService } from 'src/app/shared/services/blockchain/gas.service'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { ErrorService } from 'src/app/shared/services/error.service'
import { SignerService } from 'src/app/shared/services/signer.service'
import { UserService } from 'src/app/shared/services/user.service'

@Component({
  selector: 'app-contract-deploy-exec-env',
  templateUrl: './contract-deploy-exec-env.component.html',
  styleUrls: ['./contract-deploy-exec-env.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractDeployExecEnvComponent {

  issuer$ = this.issuerService.issuer$

  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  contractDeploymentRequest$ = this.contractDeploymentService
    .getContractDeploymentRequest(this.route.snapshot.params.id).pipe(tap(res => console.log(res)))

  manifest$ = this.contractDeploymentRequest$.pipe(
    switchMap(result => this.manifestService.getByID(result.contract_id))
  )

  address$ = this.preferenceQuery.address$
  isWaitingForTxSub = new BehaviorSubject<boolean>(false)
  isWaitingForTx$ = this.isWaitingForTxSub.asObservable()
  

  constructor(
    private preferenceQuery: PreferenceQuery,
    private issuerService: IssuerService,
    private manifestService: ContractManifestService,
    private dialogService: DialogService,
    private signerService: SignerService,
    private sessionQuery: SessionQuery,
    private route: ActivatedRoute,
    private contractDeploymentService: ContractDeploymentService
  ) { }

  login() {
      this.signerService.ensureAuth
  }

  deployContract(contractDeploymentRequest: ContractDeploymentRequestResponse) {
    return () => {
      return this.contractDeploymentService.deployContract(contractDeploymentRequest).pipe(
        tap(() => { this.isWaitingForTxSub.next(true) }),
        switchMap(result => this.sessionQuery.provider.waitForTransaction(result.hash)),
        switchMap(result => this.contractDeploymentService.attachTxInfoToRequest(
          contractDeploymentRequest.id,
          result.transactionHash,
          this.preferenceQuery.getValue().address
        )),
        delay(1000),
        tap(() => {
          this.contractDeploymentRequest$ = this.contractDeploymentService
            .getContractDeploymentRequest(this.route.snapshot.params.id)
          this.isWaitingForTxSub.next(false)
        })
      )
    }
  }

}