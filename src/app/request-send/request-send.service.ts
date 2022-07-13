import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { BackendHttpClient } from '../shared/services/backend/backend-http-client.service'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class RequestSendService {
  path = `${environment.backendURL}/api/blockchain-api/v1`

  constructor(private http: BackendHttpClient) {}

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
