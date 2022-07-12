import { Injectable } from '@angular/core'
import { Observable, switchMap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { environment } from '../../../../environments/environment'
import { BackendHttpClient } from './backend-http-client.service'

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  path = `${environment.backendURL}/api/blockchain-api/v1/projects`

  constructor(
    private http: BackendHttpClient,
    private preferenceQuery: PreferenceQuery
  ) {}

  createNewProject(issuerContractAddress: string): Observable<ProjectModel> {
    return this.http.post<ProjectModel>(this.path, {
      issuer_contract_address: issuerContractAddress,
      base_redirect_url: '',
      chain_id: this.preferenceQuery.network.chainID,
    })
  }

  createApiKey(projectID: string): Observable<ApiKeyModel> {
    return this.http.post<ApiKeyModel>(`${this.path}/${projectID}/api-key`, {})
  }

  getProjectIdByChainAndAddress(): Observable<ProjectModel> {
    return this.http.get<ProjectModel>(
      `${this.path}/by-chain/${this.preferenceQuery.network.chainID}/by-issuer/${this.preferenceQuery.issuer.address}`
    )
  }

  fetchApiKey(): Observable<ApiKeyModel> {
    return this.getProjectIdByChainAndAddress().pipe(
      switchMap((project) =>
        this.http.get<ApiKeyModel>(`${this.path}/${project.id}/api-key`)
      )
    )
  }
}

interface ProjectModel {
  id: string
  owner_id: string
  issuer_contract_address: string
  base_redirect_url: string
  chain_id: number
  custom_rpc_url: string
  created_at: string
}

interface ApiKeyModel {
  id: string
  project_id: string
  api_key: string
  created_at: string
}
