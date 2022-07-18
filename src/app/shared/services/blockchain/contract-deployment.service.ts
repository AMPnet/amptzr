import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { PreferenceQuery } from "src/app/preference/state/preference.query"
import { environment } from "src/environments/environment"
import { BackendHttpClient } from "../backend/backend-http-client.service"

@Injectable({
  providedIn: 'root',
})
export class ContractDeploymentService {

    path = `${environment.backendURL}/api/blockchain-api/v1`
 
    constructor(private http: BackendHttpClient,
        private preferenceQuery: PreferenceQuery) {}

    createDeploymentRequestBase(data: ContractDeploymentParams): Observable<ContractDeploymentResponse> {
        return this.http
            .post<ContractDeploymentResponse>(`${this.path}/deploy`, 
                data, true, true, true)
    }

    createDeploymentRequest(contractId: string, 
        constructorParams: ConstructorParam[],
        screenConfig: ScreenConfig): Observable<ContractDeploymentResponse> {
            
        const queryValue = this.preferenceQuery.getValue()
        return this.createDeploymentRequestBase({
            contract_id: contractId,
            constructor_params: constructorParams,
            deployer_address: queryValue.address,
            initial_eth_amount: '0',
            arbitrary_data: '',
            screen_config: screenConfig,
            redirect_url: queryValue.issuer.slug ?? ''
        })
    }

    getContractDeploymentRequests(projectID: string): Observable<ContractDeploymentRequests> {
        return this.http
            .get<ContractDeploymentRequests>(`${this.path}/deploy/by-project/${projectID}`, { }, true, true, true)
    }
}

export interface ContractDeploymentRequests {
    requests: ContractDeploymentResponse[]
}

export interface ContractDeploymentResponse {
    id: string,
    status: string,
    contract_id: string,
    contract_deployment_data: string,
    contract_tags: string[],
    contract_implements: string[],
    initial_eth_amount: string[],
    chain_id: string,
    redirect_url: string,
    project_id: string,
    created_at: string,
    arbitrary_data: string,
    screen_config: {
        before_action_message: string,
        after_action_message: string,
    },
    contract_address: string,
    deployer_address: string,
    deploy_tx: {
        tx_hash: string,
        from: string,
        to: string,
        data: string,
        value: string,
        block_confirmations: string,
        timestamp: string
    }
}

export interface ContractDeploymentParams {
    contract_id: string,
    redirect_url: string,
    constructor_params: ConstructorParam[],
    deployer_address: string,
    initial_eth_amount: string,
    arbitrary_data: string,
    screen_config: ScreenConfig
}

interface ConstructorParam {
    type: FunctionArgumentType,
    value: string
}

interface ScreenConfig {
    before_action_message: string,
    after_action_message: string
}


export type FunctionArgumentType = 
    'address' 
    | 'bool' 
    | 'string' 
    | 'bytes'  
    | 'byte' 
    | 'uint'
    | 'int'   