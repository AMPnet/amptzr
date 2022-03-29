import {Injectable} from '@angular/core'
import {from, Observable, switchMap} from 'rxjs'
import {environment} from '../../../../environments/environment'
import {BackendHttpClient} from "./backend-http-client.service"
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {address} from '../../../../../types/common'
import {map} from 'rxjs/operators'
import {SessionQuery} from '../../../session/state/session.query'

@Injectable({
  providedIn: 'root',
})
export class PayoutService {
  path = `${environment.backendURL}/api/payout`

  constructor(private http: BackendHttpClient,
              private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery) {
  }

  createPayout(assetAddress: string, ignoredHolderAddresses: string[] = []): Observable<CreatePayoutRes> {
    const chainID = this.preferenceQuery.network.chainID

    return from(this.sessionQuery.provider.getBlockNumber()).pipe(
      switchMap(blockNumber => this.http.post<CreatePayoutRes>(
        `${this.path}/payouts/${chainID}/${assetAddress}`, {
          payout_block_number: blockNumber.toString(),
          ignored_holder_addresses: ignoredHolderAddresses,
          issuer_address: this.preferenceQuery.issuer.address,
        } as CreatePayoutData)),
    )
  }

  getPayouts(): Observable<Payout[]> {
    return this.http.get<PayoutsRes>(
      `${this.path}/payouts/${this.preferenceQuery.network.chainID}`,
      {
        issuer: this.preferenceQuery.issuer.address ?? undefined,
        owner: this.preferenceQuery.getValue().address ?? undefined,
        assetFactories: this.preferenceQuery.assetFactories.join(','),
        payoutService: this.preferenceQuery.network.tokenizerConfig.payoutService,
        payoutManager: this.preferenceQuery.network.tokenizerConfig.payoutManager,
      } as GetPayoutsParams,
    ).pipe(
      map(res => res.payouts),
    )
  }
}

interface GetPayoutsParams {
  status?: PayoutStatus
  issuer?: address,
  owner?: address,
  assetFactories: string,
  payoutService: address,
  payoutManager: address,
}

export enum PayoutStatus {
  ProofPending = 'PROOF_PENDING',
  ProofFailed = 'PROOF_FAILED',
  ProofCreated = 'PROOF_CREATED',
  PayoutCreated = 'PAYOUT_CREATED',
}

interface PayoutsRes {
  payouts: Payout[]
}

export interface Payout {
  task_id: string;
  status: PayoutStatus;
  issuer: string;
  payout_id: string;
  payout_owner: string;
  payout_info: string;
  is_canceled: boolean;
  asset: string;
  total_asset_amount: string;
  ignored_asset_addresses: string[];
  asset_snapshot_merkle_root: string;
  asset_snapshot_merkle_depth: number;
  asset_snapshot_block_number: string;
  asset_snapshot_merkle_ipfs_hash: string;
  reward_asset: string;
  total_reward_amount: string;
  remaining_reward_amount: string;
}

interface CreatePayoutData {
  payout_block_number: string;
  ignored_holder_addresses: address[];
  issuer_address: address;
}

interface CreatePayoutRes {
  task_id: string;
}
