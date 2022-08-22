import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { combineLatest, from, Observable, of, switchMap, tap } from "rxjs"
import { PreferenceQuery } from "src/app/preference/state/preference.query"
import { SessionQuery } from "src/app/session/state/session.query"
import { environment } from "src/environments/environment"
import { BackendHttpClient } from "../backend/backend-http-client.service"
import { DialogService } from "../dialog.service"
import { ErrorService } from "../error.service"
import { SignerService } from "../signer.service"
import { GasService } from "./gas.service"

@Injectable({
  providedIn: 'root',
})
export class ContractDeploymentService {

    path = `${environment.backendURL}/api/blockchain-api/v1`

    deploymentRequestCache: ContractDeploymentRequests | null = null
 
    constructor(private http: BackendHttpClient,
        private preferenceQuery: PreferenceQuery,
        private signerService: SignerService,
        private dialogService: DialogService,
        private sessionQuery: SessionQuery,
        private errorService: ErrorService,
        private gasService: GasService) {}

    createDeploymentRequestBase(data: ContractDeploymentParams): Observable<ContractDeploymentRequestResponse> {
        return this.http
            .post<ContractDeploymentRequestResponse>(`${this.path}/deploy`, 
                data, true, true, true)
    }

    createDeploymentRequest(contractId: string, 
        alias: string,
        constructorParams: ConstructorParam[],
        screenConfig: ScreenConfig): Observable<ContractDeploymentRequestResponse> {
            
        const queryValue = this.preferenceQuery.getValue()
        return this.createDeploymentRequestBase({
            alias: alias,
            contract_id: contractId,
            constructor_params: constructorParams,
            deployer_address: queryValue.address,
            initial_eth_amount: '0',
            arbitrary_data: '',
            screen_config: screenConfig,
            redirect_url: queryValue.issuer.slug ?? ''
        })
    }

    getContractDeploymentRequest(deploymentRequestID: string): Observable<ContractDeploymentRequestResponse> {
        return this.http
            .get<ContractDeploymentRequestResponse>(`${this.path}/deploy/${deploymentRequestID}`, { }, true, true, true)
    }

    getContractDeploymentRequests(projectID: string, deployedOnly: boolean = false): Observable<ContractDeploymentRequests> {
        if(this.deploymentRequestCache !== null) { return of(this.deploymentRequestCache) }
        return this.http
            .get<ContractDeploymentRequests>(`${this.path}/deploy/by-project/${projectID}`, {
                deployedOnly: deployedOnly 
            }, true, true, true).pipe(tap(res => { this.deploymentRequestCache = res }))
    }

    attachTxInfoToRequest(requestId: string, txHash: string, deployer: string) {
        return this.http
            .put<void>(`${this.path}/deploy/${requestId}`, { 
                tx_hash: txHash,
                caller_address: deployer
            }, true, true)
    }

    deployContract(request: ContractDeploymentRequestResponse) {
        return this.signerService.ensureNetwork.pipe(
            switchMap((signer) =>
                of(request.deploy_tx).pipe(
                  switchMap((contract) =>
                    combineLatest([of(contract), this.gasService.overrides])
                  ),
                  switchMap(([contract, overrides]) => {
                    console.log(contract)
                    return signer.populateTransaction({
                        value: contract.value,
                        data: contract.data,
                        from: contract.from,
                        ...overrides
                    }) }
                  ),
                  switchMap((tx) => this.signerService.sendTransaction(tx))
                )
              ),
            this.errorService.handleError(false, true)
          )
    }

    callReadOnlyFunction(deployedContractID: string, callData: ReadOnlyFunctionCallData) {
        return this.http.post<ReadOnlyFunctionResponse>(`${this.path}/readonly-function-call`, {
            ...callData,
            deployed_contract_id: deployedContractID
        }, true, true, true)
    }

    createWriteFunctionCallRequest(deployedContractID: string, functionCallData: FunctionCallData) {
        return this.http.post<FunctionCallRequestResponse>(`${this.path}/function-call`, {
            ...functionCallData,
            deployed_contract_id: deployedContractID
        }, false, true, true)
    }

    getFunctionCallRequest(id: string) {
        return this.http.get<FunctionCallRequestResponse>(`${this.path}/function-call/${id}`, { }, false, false, true)
    }
}

export interface ReadOnlyFunctionCallData {
    block_number: number,
    function_name: string,
    function_params: {
        type: FunctionArgumentType,
        value: string
    }[],
    output_params: string[],
    caller_address: string
}

export interface ReadOnlyFunctionResponse {
    deployed_contract_id: string,
    contract_address: string,
    block_number: number,
    timestamp: string,
    return_values: string[]
}

export interface FunctionCallData {
    function_name: string,
    function_params: {
        type: FunctionArgumentType,
        value: string
    }[],
    eth_amount: number
}

export interface FunctionCallRequestResponse {
    id: string,
    status: string,
    deployed_contract_id: string,
    contract_address: string,
    function_name: string,
    function_params: {
        type: FunctionArgumentType,
        value: string
    }[],
    function_call_data: string,
    eth_amount: string,
    chain_id: string,
    redirect_url: string,
    project_id: string,
    created_at: string,
    caller_address: string,
    function_call_tx: {
        tx_hash: string,
        from: string,
        to: string,
        data: string,
        value: number,
        block_confirmations: string,
        timestamp: string
    }

}

export interface ContractDeploymentRequests {
    requests: ContractDeploymentRequestResponse[]
}

export interface ContractDeploymentRequestResponse {
    id: string,
    status: string,
    alias: string,
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
    alias: string,
    contract_id: string,
    redirect_url: string,
    constructor_params: ConstructorParam[],
    deployer_address: string,
    initial_eth_amount: string,
    arbitrary_data: string,
    screen_config: ScreenConfig
}

export interface ConstructorParam {
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