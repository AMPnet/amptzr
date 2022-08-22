import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { ContractDeploymentRequestResponse, ContractDeploymentRequests } from '../../services/blockchain/contract-deployment.service'

@Injectable({
    providedIn: 'root',
})
export class SmartInputDisplayService {

    private isDialogOpenSub = new BehaviorSubject(false)
    isDialogOpen$ = this.isDialogOpenSub.asObservable()

    private selectedItemSub = new BehaviorSubject<ContractDeploymentRequestResponse | null>(null)
    selectedItem$ = this.selectedItemSub.asObservable()

    constructor() { }

    toggleDialog() {
        this.isDialogOpenSub.next(!this.isDialogOpenSub.getValue())
    }

    itemSelected(item: any) {
        this.isDialogOpenSub.next(false)
        this.selectedItemSub.next(item)
    }
}
