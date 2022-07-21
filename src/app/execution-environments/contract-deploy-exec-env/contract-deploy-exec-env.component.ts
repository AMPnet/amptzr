import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { delay, from, merge, of, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { ContractDeploymentRequests, ContractDeploymentRequestResponse, ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { GasService } from 'src/app/shared/services/blockchain/gas.service'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { ErrorService } from 'src/app/shared/services/error.service'
import { SignerService } from 'src/app/shared/services/signer.service'

@Component({
  selector: 'app-contract-deploy-exec-env',
  templateUrl: './contract-deploy-exec-env.component.html',
  styleUrls: ['./contract-deploy-exec-env.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractDeployExecEnvComponent {

  issuer$ = this.issuerService.issuer$

  contractDeploymentRequest$ = this.contractDeploymentService
    .getContractDeploymentRequest(this.route.snapshot.params.id)

  address$ = this.preferenceQuery.address$
  

  constructor(
    private preferenceQuery: PreferenceQuery,
    private issuerService: IssuerService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private contractDeploymentService: ContractDeploymentService
  ) { }

  deployContract(contractDeploymentRequest: ContractDeploymentRequestResponse) {
    return () => {
      return this.contractDeploymentService.deployContract(contractDeploymentRequest).pipe(
        switchMap(result => this.contractDeploymentService.attachTxInfoToRequest(
          contractDeploymentRequest.id,
          result.transactionHash,
          this.preferenceQuery.getValue().address
        )),
        switchMap(() => this.dialogService.success({
          message: "You have successfully deployed a smart contract"
        })),
        delay(1000),
        tap(() => {
          this.contractDeploymentRequest$ = this.contractDeploymentService
            .getContractDeploymentRequest(this.route.snapshot.params.id)
        })
      )
    }
  }

}
