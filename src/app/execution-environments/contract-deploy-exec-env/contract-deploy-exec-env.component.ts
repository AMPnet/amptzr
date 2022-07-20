import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'
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
    .getContractDeploymentRequest("050aa375-b8ad-4d6c-b9d3-f1ad836c7c73")

  constructor(
    private preferenceQuery: PreferenceQuery,
    private signerService: SignerService,
    private issuerService: IssuerService,
    private contractDeploymentService: ContractDeploymentService
  ) { }

}
