import {Injectable} from '@angular/core'
import {environment} from '../../environments/environment'
import {BackendHttpClient} from '../shared/services/backend/backend-http-client.service'
import {Observable} from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class RequestBalanceService {
  path = `${environment.backendURL}/api/blockchain-api`

  constructor(private http: BackendHttpClient) {
  }

  getRequest(id: string): Observable<RequestBalance> {
    return this.http.get<RequestBalance>(`${this.path}/balance/${id}`, {}, true)
  }

  createRequest(data: CreateRequestBalanceData): Observable<RequestBalance> {
    return this.http.post<RequestBalance>(`${this.path}/balance`, data, true)
  }

  updateRequest(id: string, data: UpdateRequestBalanceData): Observable<RequestBalance> {
    return this.http.put<RequestBalance>(`${this.path}/balance/${id}`, data, true)
  }
}

interface CreateRequestBalanceData {
  client_id?: string;
  block_number?: string;
  chain_id?: number;
  token_address?: string;
  wallet_address?: string;
  redirect_url?: string;
  arbitrary_data?: ArbitraryData;
  screen_config?: ScreenConfig;
}

interface UpdateRequestBalanceData {
  wallet_address: string,
  signed_message: string,
}

export interface RequestBalance {
  id: string;
  status: SendRequestStatus;
  chain_id: number;
  redirect_url: string;
  token_address: string;
  block_number: string;
  wallet_address?: string;
  arbitrary_data?: ArbitraryData;
  screen_config?: Partial<ScreenConfig>;
  balance?: BalanceData;
  message_to_sign: string;
  signed_message?: string;
}

interface ArbitraryData {
  [key: string]: string
}

interface ScreenConfig {
  before_action_message: string;
  after_action_message: string;
}

interface BalanceData {
  amount: string;
  block_number: string;
  timestamp: Date;
  wallet: string;
}

export enum SendRequestStatus {
  Pending = 'PENDING',
  Success = 'SUCCESS',
  Failed = 'FAILED',
}
