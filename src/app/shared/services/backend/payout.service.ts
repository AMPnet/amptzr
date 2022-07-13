import { Injectable } from '@angular/core'
import { from, Observable, switchMap } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { BackendHttpClient } from './backend-http-client.service'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { address } from '../../../../../types/common'
import { map } from 'rxjs/operators'
import { SessionQuery } from '../../../session/state/session.query'
import { ChainID } from '../../networks'

@Injectable({
  providedIn: 'root',
})
export class PayoutService {
  path = `${environment.backendURL}/api/payout`

  constructor(
    private http: BackendHttpClient,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery
  ) {}

  createSnapshot(
    assetAddress: string,
    ignoredHolderAddresses: string[] = []
  ): Observable<CreatePayoutRes> {
    return from(this.sessionQuery.provider.getBlockNumber()).pipe(
      switchMap((blockNumber) =>
        this.http.post<CreatePayoutRes>(`${this.path}/snapshots`, {
          name: '', // TODO add name from the form
          chain_id: this.preferenceQuery.network.chainID,
          asset_address: assetAddress,
          payout_block_number: blockNumber.toString(),
          ignored_holder_addresses: ignoredHolderAddresses,
        } as CreateSnapshotData)
      )
    )
  }

  getSnapshots(): Observable<Snapshot[]> {
    return this.http
      .get<GetSnapshotsRes>(
        `${this.path}/snapshots`,
        {
          chainId: this.preferenceQuery.network.chainID,
          issuer: this.preferenceQuery.issuer.address ?? undefined,
          owner: this.preferenceQuery.getValue().address ?? undefined,
          assetFactories: this.preferenceQuery.assetFactories.join(','),
          payoutService:
            this.preferenceQuery.network.tokenizerConfig.payoutService,
          payoutManager:
            this.preferenceQuery.network.tokenizerConfig.payoutManager,
        } as GetSnapshotsParams,
        false,
        false
      )
      .pipe(map((res) => res.snapshots))
  }

  getSnapshot(id: string): Observable<Snapshot> {
    return this.http.get<Snapshot>(`${this.path}/snapshots/${id}`)
  }

  getClaimablePayouts(): Observable<ClaimablePayout[]> {
    return this.http
      .get<GetClaimablePayoutsRes>(`${this.path}/claimable_payouts`, {
        chainId: this.preferenceQuery.network.chainID,
        // Commented out to see claims for all issuers (implicitly all tokens).
        // issuer: this.preferenceQuery.issuer.address ?? undefined,
        assetFactories: this.preferenceQuery.assetFactories.join(','),
        payoutService:
          this.preferenceQuery.network.tokenizerConfig.payoutService,
        payoutManager:
          this.preferenceQuery.network.tokenizerConfig.payoutManager,
      } as GetClaimablePayoutsParams)
      .pipe(map((res) => res.claimable_payouts))
  }
}

interface GetSnapshotsParams {
  chainId?: ChainID
  status?: SnapshotStatus
  issuer?: address
  owner?: address
  assetFactories: string
  payoutService: address
  payoutManager: address
}

export enum SnapshotStatus {
  Pending = 'PENDING',
  Failed = 'FAILED',
  Success = 'SUCCESS',
}

interface GetSnapshotsRes {
  snapshots: Snapshot[]
}

export interface Snapshot {
  id: string
  name: string
  chain_id: number
  status: SnapshotStatus
  owner: string
  asset: string
  total_asset_amount: string
  ignored_holder_addresses: string[]
  asset_snapshot_merkle_root: string
  asset_snapshot_merkle_depth: number
  asset_snapshot_block_number: string
  asset_snapshot_merkle_ipfs_hash: string
}

interface CreateSnapshotData {
  name: string
  chain_id: ChainID
  asset_address: address
  payout_block_number: string
  ignored_holder_addresses: address[]
}

interface CreatePayoutRes {
  id: string
}

interface GetClaimablePayoutsParams {
  chainId: ChainID
  issuer?: address
  assetFactories: string
  payoutService: address
  payoutManager: address
}

interface GetClaimablePayoutsRes {
  claimable_payouts: ClaimablePayout[]
}

export interface ClaimablePayout {
  payout: Payout
  investor: string
  amount_claimed: string
  amount_claimable: string
  balance: string
  proof: string[]
}

interface Payout {
  payout_id: string
  payout_owner: string
  payout_info: string
  is_canceled: boolean
  asset: string
  total_asset_amount: string
  ignored_holder_addresses: string[]
  asset_snapshot_merkle_root: string
  asset_snapshot_merkle_depth: number
  asset_snapshot_block_number: string
  asset_snapshot_merkle_ipfs_hash: string
  reward_asset: string
  total_reward_amount: string
  remaining_reward_amount: string
}
