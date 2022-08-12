import { Injectable } from '@angular/core'
import { Observable, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { PreferenceStore } from 'src/app/preference/state/preference.store'
import { environment } from '../../../../environments/environment'
import { BackendHttpClient } from './backend-http-client.service'

@Injectable({
  providedIn: 'root',
})
export class ContractManifestService {
  path = `${environment.backendURL}/api/blockchain-api/v1/deployable-contracts`

  constructor(private http: BackendHttpClient) {}

  getByID(id: string) {
    return this.http.get<ContractManifestData>(`${this.path}/${id}`, { }, true, false, true)
  }
  
}

export interface ContractManifestsData {
  deployable_contracts: ContractManifestData[]
}

export interface ContractManifestData {
  id: string,
  binary: string,
  tags: string[],
  implements: string[],
  constructors: ConstructorManifest[],
  functions: FunctionManifest[]
}

export interface FunctionManifest {
  name: string,
  description: string,
  solidity_name: string,
  inputs: ParamsManifest[],
  outputs: ParamsManifest[],
  read_only: boolean
}

export interface ConstructorManifest {
  inputs: ParamsManifest[]
}

export interface ParamsManifest {
  name: string,
  description: string,
  solidity_name: string,
  solidity_type: string,
  recommended_types: string[]
}