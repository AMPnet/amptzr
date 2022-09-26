import { HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { PreferenceStore } from 'src/app/preference/state/preference.store'
import { environment } from '../../../../environments/environment'
import { BackendHttpClient } from './backend-http-client.service'
import { ProjectService } from './project.service'

@Injectable({
  providedIn: 'root',
})
export class ContractManifestService {
  path = `${environment.backendURL}/api/blockchain-api/v1/deployable-contracts`

  constructor(private http: BackendHttpClient,
    private projectService: ProjectService) {}

  getByID(id: string, projectID: string = "") {
    return this.http.get<ContractManifestData>(`${this.path}/${id}`, { 
      projectId: projectID
    }, true, false, true)
  }

  getAll() {
    return this.http.get<ContractManifestsData>(`${this.path}`, {}, true, false, true)
  }
  
  getInfoMDByID(id: string) {
    return this.http.http.get<string>(`${this.path}/${id}/info.md`, {
      responseType: 'text' as 'json'
    })
  }
  
}

export interface ContractManifestsData {
  deployable_contracts: ContractManifestData[]
}

export interface ContractManifestData {
  id: string,
  binary: string,
  tags: string[],
  name: string,
  description: string,
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
  parameters?: ParamsManifest[]
  recommended_types: string[]
}