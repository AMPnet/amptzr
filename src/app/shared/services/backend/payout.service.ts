import {Injectable} from '@angular/core'
import {from, Observable, switchMap} from 'rxjs'
import {environment} from '../../../../environments/environment'
import {BackendHttpClient} from "./backend-http-client.service"
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {address} from '../../../../../types/common'
import {map} from 'rxjs/operators'
import {SessionQuery} from '../../../session/state/session.query'
import {ChainID} from '../../networks'

@Injectable({
  providedIn: 'root',
})
export class PayoutService {
  path = `${environment.backendURL}/api/payout`

  constructor(private http: BackendHttpClient,
              private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery) {
  }

  createSnapshot(assetAddress: string, ignoredHolderAddresses: string[] = []): Observable<CreatePayoutRes> {
    const chainID = this.preferenceQuery.network.chainID

    return from(this.sessionQuery.provider.getBlockNumber()).pipe(
      switchMap(blockNumber => this.http.post<CreatePayoutRes>(
        `${this.path}/snapshots`, {
          chain_id: chainID,
          asset_address: assetAddress,
          payout_block_number: blockNumber.toString(),
          ignored_holder_addresses: ignoredHolderAddresses,
          issuer_address: this.preferenceQuery.issuer.address,
        } as CreateSnapshotData)),
    )
  }

  getSnapshots(): Observable<Snapshot[]> {
    return this.http.get<PayoutsRes>(
      `${this.path}/snapshots`,
      {
        chainId: this.preferenceQuery.network.chainID,
        issuer: this.preferenceQuery.issuer.address ?? undefined,
        owner: this.preferenceQuery.getValue().address ?? undefined,
        assetFactories: this.preferenceQuery.assetFactories.join(','),
        payoutService: this.preferenceQuery.network.tokenizerConfig.payoutService,
        payoutManager: this.preferenceQuery.network.tokenizerConfig.payoutManager,
      } as getSnapshotsParams,
    ).pipe(
      map(res => res.snapshots),
    )
  }

  getSnapshot(id: string): Observable<Snapshot> {
    return this.http.get<Snapshot>(
      `${this.path}/snapshots/${id}`,
    )
  }
}

interface getSnapshotsParams {
  chainId?: ChainID,
  status?: SnapshotStatus
  issuer?: address,
  owner?: address,
  assetFactories: string,
  payoutService: address,
  payoutManager: address,
}

export enum SnapshotStatus {
  Pending = 'PENDING',
  Failed = 'FAILED',
  Created = 'CREATED',
}

interface PayoutsRes {
  snapshots: Snapshot[]
}

export interface Snapshot {
  id: string;
  name: string;
  chain_id: number;
  status: SnapshotStatus;
  owner: string;
  asset: string;
  total_asset_amount: string;
  ignored_holder_addresses: string[];
  asset_snapshot_merkle_root: string;
  asset_snapshot_merkle_depth: number;
  asset_snapshot_block_number: string;
  asset_snapshot_merkle_ipfs_hash: string;
}

interface CreateSnapshotData {
  chain_id: ChainID,
  asset_address: address
  payout_block_number: string;
  ignored_holder_addresses: address[];
}

interface CreatePayoutRes {
  id: string;
}
