import { ChangeDetectionStrategy, Component } from '@angular/core'
import { SignerService } from '../shared/services/signer.service'
import { finalize, map, switchMap } from 'rxjs/operators'
import { combineLatest, Observable, of } from 'rxjs'
import { AuthProvider } from '../preference/state/preference.store'
import { WithStatus, withStatus } from '../shared/utils/observables'
import { RouterService } from '../shared/services/router.service'
import { StablecoinService } from '../shared/services/blockchain/stablecoin.service'
import { UserService } from '../shared/services/user.service'
import { TransactionType } from '../shared/services/backend/report.service'
import { BackendHttpClient } from '../shared/services/backend/backend-http-client.service'
import { PreferenceQuery } from '../preference/state/preference.query'
import {
  BackendUser,
  BackendUserService,
} from '../shared/services/backend/backend-user.service'
import { MagicSubsignerService } from '../shared/services/subsigners/magic-subsigner.service'
import { TransferService } from '../transfer/transfer.service'
import { QueryService } from '../shared/services/blockchain/query.service'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../shared/services/blockchain/asset/asset.service'
import { BigNumber } from 'ethers'
import { WalletConnectSubsignerService } from '../shared/services/subsigners/walletconnect-subsigner.service'
import { AssetFlavor } from '../shared/services/blockchain/flavors'
import { PhysicalInputService } from '../shared/services/physical-input.service'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {
  authProviderType = AuthProvider
  transactionType = TransactionType

  authProvider$ = this.preferenceQuery.authProvider$
  isAdvancedMode$ = this.physicalInputService.altKeyActive$

  user$: Observable<Partial<BackendUser>> =
    this.preferenceQuery.isBackendAuthorized$.pipe(
      switchMap((isAuth) =>
        isAuth ? this.backendUserService.getUser() : of({})
      )
    )

  address$ = this.preferenceQuery.address$
  balance$ = withStatus(this.userService.nativeTokenBalance$)

  assets$: Observable<WithStatus<AssetWithInfoWithBalance[]>> =
    this.address$.pipe(
      switchMap((address) =>
        withStatus(
          this.queryService
            .getAssetsBalancesForOwnerAddress(address)
            .pipe(
              switchMap((res) =>
                res.length > 0
                  ? combineLatest(
                      res.map((item) =>
                        item.assetCommonState?.info
                          ? this.assetService
                              .getAssetInfo(item.assetCommonState)
                              .pipe(map((asset) => ({ ...item, asset })))
                          : of({ ...item, asset: undefined })
                      )
                    )
                  : of([])
              )
            )
        )
      )
    )

  constructor(
    private preferenceQuery: PreferenceQuery,
    private signerService: SignerService,
    public stablecoin: StablecoinService,
    public transferService: TransferService,
    private physicalInputService: PhysicalInputService,
    private userService: UserService,
    private backendUserService: BackendUserService,
    private queryService: QueryService,
    private assetService: AssetService,
    private magicSubsignerService: MagicSubsignerService,
    public walletConnectSubsignerService: WalletConnectSubsignerService,
    private http: BackendHttpClient,
    private router: RouterService
  ) {}

  logout() {
    this.userService
      .logout()
      .pipe(finalize(() => this.router.navigate(['/'])))
      .subscribe()
  }

  manageMagicWallet(): Observable<unknown> {
    return this.magicSubsignerService.showSettings()
  }

  isAssetTransferable(flavor: unknown): boolean {
    switch (flavor) {
      case AssetFlavor.BASIC:
        return false
      case AssetFlavor.TRANSFERABLE:
      case AssetFlavor.SIMPLE:
      default:
        return true
    }
  }
}

interface AssetWithInfoWithBalance {
  contractAddress: string
  decimals: number
  symbol: string
  name: string
  balance: BigNumber
  asset?: CommonAssetWithInfo
}
