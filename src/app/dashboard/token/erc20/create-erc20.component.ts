import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { BehaviorSubject, of, switchMap, tap } from 'rxjs'
import { ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { RouterService } from 'src/app/shared/services/router.service'

@Component({
  selector: 'app-erc20',
  templateUrl: './create-erc20.component.html',
  styleUrls: ['./create-erc20.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateErc20Component {
  createTokenForm = new FormGroup({
    tokenName: new FormControl('', [Validators.required]),

    tokenSupply: new FormControl('', [Validators.required, Validators.min(1)]),

    tokenSymbol: new FormControl('', [Validators.required, 
      Validators.pattern('^[a-zA-Z0-9]*$')]),

    tokenAlias: new FormControl('', [Validators.required, 
      Validators.pattern('^[A-Za-z_-][A-Za-z0-9_-]*$')]),
  })

  checkSelected$ = new BehaviorSubject<boolean>(false)

  onSecondaryAction$ = of('').pipe(tap(() => { alert("Here")} ))
  
  onConfirm$ = of(undefined).pipe(tap(() => { 
    this.routerService.navigate(['/admin/dashboard/tokens'], {
      queryParams: { screenConfig: 'requests' }
    })
  }))

  constructor(private contractDeploymentService: ContractDeploymentService,
    private routerService: RouterService,
    private dialogService: DialogService) {}

  onCheckChange(event: any) {
    this.checkSelected$.next(!this.checkSelected$.value)
  }

  isDirtyAndInvalid(formControlName: string): boolean {
    const control = this.createTokenForm.controls[formControlName]
    return control.invalid && control.dirty
  }

  isDirtyAndValid(formControlName: string): boolean {
    const control = this.createTokenForm.controls[formControlName]
    return control.valid && control.dirty
  }

  deployContract() {
    const controls = this.createTokenForm.controls

    return () => {
      return this.contractDeploymentService.createDeploymentRequest(
        'openzeppelin.erc20', String(controls.tokenAlias.value).toLowerCase(), [ 
          { type: 'string', value: controls.tokenName.value }, 
          { type: 'string', value: String(controls.tokenSymbol.value).toUpperCase() } ],
        {
          after_action_message: '',
          before_action_message: ''
        }
      ).pipe(
        switchMap(() => {
          return this.dialogService.infoWithOnConfirmAndSecondary({
            title: "Token deployment request created",
            message: "You will not be able to interact with the token, until you deploy it on blockchain.",
            cancelable: false,
          }, 'Deploy contract now', 'Deploy later', this.onConfirm$, this.onSecondaryAction$)
        })
      )
    }
    
  }
}
