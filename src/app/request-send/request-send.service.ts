import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { BackendHttpClient } from '../shared/services/backend/backend-http-client.service'
import { Observable, switchMap } from 'rxjs'
import { ProjectService } from '../shared/services/backend/project.service'

@Injectable({
  providedIn: 'root',
})
export class RequestSendService {
  path = `${environment.backendURL}/api/blockchain-api/v1`

  constructor(
    private http: BackendHttpClient,
    private projectService: ProjectService
  ) {}

  getRequest(id: string): Observable<RequestSend> {
    return this.http.get<RequestSend>(`${this.path}/send/${id}`, {}, true)
  }

  createRequest(data: CreateRequestSendData): Observable<RequestSend> {
    return this.http.post<RequestSend>(`${this.path}/send`, data, true)
  }

  updateRequest(
    id: string,
    data: UpdateRequestSendData
  ): Observable<RequestSend> {
    return this.http.put<RequestSend>(`${this.path}/send/${id}`, data, true)
  }

  getAllRequests(projectID: string): Observable<SendRequests> {
    return this.http.get<SendRequests>(
      `${this.path}/send/by-project/${projectID}`,
      {},
      false
    )
  }

  createRequestWithAPI(data: APISendRequestData): Observable<SendRequestItem> {
    return this.http.post<SendRequestItem>(
      `${this.path}/send`,
      data,
      false,
      true,
      true
    )
  }
}

interface APISendRequestData {
  asset_type: 'TOKEN' | 'NATIVE'
  amount: string
  token_address: string
  recipient_address: string
}

export interface SendRequests {
  requests: SendRequestItem[]
}

export interface SendRequestItem {
  id: string
  project_id: string
  status: string
  chain_id: string
  token_address: string
  asset_type: string
  amount: string
  sender_address: string
  recipient_address: string
  redirect_url: string
  created_at: string
}

interface CreateRequestSendData {
  client_id?: string
  chain_id?: number
  token_address?: string
  amount: string
  sender_address?: string
  recipient_address?: string
  redirect_url?: string
  arbitrary_data?: ArbitraryData
  screen_config?: ScreenConfig
}

interface UpdateRequestSendData {
  tx_hash: string
  caller_address: string
}

export interface RequestSend {
  id: string
  status: SendRequestStatus
  chain_id: number
  token_address: string
  amount: string
  asset_type: AssetType
  sender_address?: string
  recipient_address: string
  arbitrary_data?: ArbitraryData
  screen_config?: Partial<ScreenConfig>
  redirect_url: string
  send_tx: SendTx
}

interface ArbitraryData {
  [key: string]: string
}

interface ScreenConfig {
  before_action_message: string
  after_action_message: string
}

interface SendTx {
  tx_hash?: string
  from?: string
  to: string
  data: string
  block_confirmations?: string
}

export enum SendRequestStatus {
  Pending = 'PENDING',
  Success = 'SUCCESS',
  Failed = 'FAILED',
}

export enum AssetType {
  Native = 'NATIVE',
  Token = 'TOKEN',
}
