import { Location } from '@angular/common'
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core'
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { RouterService } from 'src/app/shared/services/router.service'
import { BehaviorSubject, map, of, switchMap, tap } from 'rxjs'
import { ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'
import { ConstructorParam, ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { marked } from 'marked'
import { easeInOutAnimation } from 'src/app/shared/utils/animations'

@Component({
  selector: 'app-deploy-from-manifest',
  templateUrl: './deploy-from-manifest.component.html',
  styleUrls: ['./deploy-from-manifest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: easeInOutAnimation
})
export class DeployFromManifestComponent {

    deployContractForm = new FormGroup({
        alias: new FormControl('', [Validators.required, 
            Validators.pattern('^[A-Za-z_-][A-Za-z0-9_-]*$')])
    })
    contractID = this.route.snapshot.params.contractID

    typesHolder: string[] = []

    onConfirm$ = of(undefined).pipe(tap(() => { 
        this.routerService.navigate(['/admin/dashboard/contracts'], {
            queryParams: { screenConfig: 'requests' }
          })
     }))
    onSecondaryAction$ = of(undefined).pipe(tap(() => { }))

    tabSub = new BehaviorSubject<Tab>("DEPLOY")
    tab$ = this.tabSub.asObservable()

    // Notifies the smart input component when the form has finished loading. Smart input requires this only
    // in cases where the form is dynamically loaded after class initialization
    finishedLoadingFormSub = new BehaviorSubject(false)

    contract$ = this.manifestService.getByID(this.contractID).pipe(
        tap((contract) => {
            const inputs = contract.constructors.at(0)?.inputs ?? []
            inputs.forEach(input => { 
                    this.deployContractForm.addControl(input.solidity_name, 
                        new FormControl('', [Validators.required]))
                    this.typesHolder.push(input.solidity_type)
                })
            this.finishedLoadingFormSub.next(true)
        })
    )
    infoMD$ = this.manifestService.getInfoMDByID(this.contractID).pipe(
        map(result => marked(result, { gfm: true }))
    )

    touchedAndValid(control: AbstractControl): boolean {
        return control.valid && control.touched
    }

    constructor(private manifestService: ContractManifestService,
        private route: ActivatedRoute,
        private routerService: RouterService,
        private location: Location,
        private dialogService: DialogService,
        private contractDeploymentService: ContractDeploymentService) {}

    changeTab(tab: Tab) {
        this.tabSub.next(tab)
    }


    createDeploymentRequest() {

        return () => {
            const controls = this.deployContractForm.controls
            const filteredControls = controls
            
            var controlsArray: AbstractControl[] = []
            for(const field in filteredControls) {
                if(field != 'alias') { 
                    const control = this.deployContractForm.get(field) 
                    if(control !== null) { controlsArray.push(control) }
                }
            }
    
            const constructorParams: ConstructorParam[] = controlsArray.map((control, index) => {
                return {
                    type: this.typesHolder[index],
                    value: control.value
                } as ConstructorParam
            })
    
            return this.contractDeploymentService.createDeploymentRequest(this.contractID, 
                controls['alias'].value, constructorParams, { after_action_message: "", before_action_message: ""}).pipe(
                    tap(_ => {
                        return this.dialogService.infoWithOnConfirm({
                            title: "Token deployment request created",
                            message: "You will not be able to interact with the token, until you deploy it on blockchain.",
                            cancelable: false,
                            onConfirm: this.onConfirm$
                            })
                    })
                )
        }
        
    }

    goBack() {
        this.routerService.navigate(['/admin/dashboard/contracts'], {
            queryParams: { screenConfig: 'deploy' }
        })
    }
}

type Tab = "DEPLOY" | "INFO"

