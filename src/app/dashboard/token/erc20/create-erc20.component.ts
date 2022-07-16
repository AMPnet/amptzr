import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { BehaviorSubject, switchMap } from 'rxjs'
import { ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { DialogService } from 'src/app/shared/services/dialog.service'

@Component({
  selector: 'app-erc20',
  templateUrl: './create-erc20.component.html',
  styleUrls: ['./create-erc20.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateErc20Component {
  createTokenForm = new FormGroup({
    tokenName: new FormControl(''),
    tokenSupply: new FormControl(''),
    tokenSymbol: new FormControl(''),
    tokenAlias: new FormControl(''),
  })

  checkSelected$ = new BehaviorSubject<boolean>(false)

  constructor(private contractDeploymentService: ContractDeploymentService,
    private dialogService: DialogService) {}

  onCheckChange(event: any) {
    this.checkSelected$.next(!this.checkSelected$.value)
  }

  deployContract() {
    return () => {
      return this.contractDeploymentService.createDeploymentRequest(
        'openzeppelin.erc20', [ 
          { type: 'string', value: 'My Token' }, 
          { type: 'string', value: 'MYTOK'} ],
        {
          after_action_message: '',
          before_action_message: ''
        }
      ).pipe(
        switchMap(() => {
          return this.dialogService.info({
            title: "Success",
            message: "Created a token deployment request",
            cancelable: false,
            secondaryAction: {
              text: "Deploy later",
              url: "https://google.com"
            }
          }, 'Deploy contract now')
        })
      )
    }
    
  }
}
