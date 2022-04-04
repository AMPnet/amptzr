import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {BehaviorSubject, combineLatest, Observable, of, switchMap} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {Payout, PayoutService, SnapshotStatus} from '../../shared/services/backend/payout.service'
import {ActivatedRoute} from '@angular/router'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {catchError, distinctUntilChanged, map, shareReplay, startWith, take, tap} from 'rxjs/operators'
import {Erc20Service, ERC20TokenData} from '../../shared/services/blockchain/erc20.service'
import {BigNumber, constants} from 'ethers'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {ConversionService} from '../../shared/services/conversion.service'
import {AssetService, CommonAssetWithInfo} from '../../shared/services/blockchain/asset/asset.service'
import {PayoutManagerService} from '../../shared/services/blockchain/payout-manager.service'
import {RouterService} from '../../shared/services/router.service'

@Component({
  selector: 'app-payouts-payout-show',
  templateUrl: './payouts-payout-show.component.html',
  styleUrls: ['./payouts-payout-show.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutsPayoutShowComponent {
  payout$: Observable<WithStatus<Payout>>
  refreshPayoutSub = new BehaviorSubject<void>(undefined)

  sendAssetForm: FormGroup
  payoutStatus = SnapshotStatus

  distributeState$: Observable<DistributeState | undefined>
  shouldApprove$: Observable<boolean>
  shouldDistribute$: Observable<boolean>

  constructor(private payoutService: PayoutService,
              private fb: FormBuilder,
              private erc20Service: Erc20Service,
              private assetService: AssetService,
              private payoutManagerService: PayoutManagerService,
              private preferenceQuery: PreferenceQuery,
              private conversion: ConversionService,
              private router: RouterService,
              private route: ActivatedRoute) {
    const taskID = this.route.snapshot.params.id

    this.payout$ = withStatus(
      this.refreshPayoutSub.asObservable().pipe(
        switchMap(() => this.payoutService.getPayout(taskID)),
      ),
    )

    this.sendAssetForm = this.fb.group({
      payoutAssetAddress: [
        '',
        [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)],
      ],
      tokenAmount: [''],
    }, {
      asyncValidators: this.amountValidator.bind(this),
    })

    const payoutAssetAddressChanged$ = this.sendAssetForm.get('payoutAssetAddress')!.valueChanges.pipe(
      startWith(this.sendAssetForm.value.payoutAssetAddress),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const tokenAmountChanged$ = this.sendAssetForm.get('tokenAmount')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged((p, c) => p == c),
      shareReplay(1),
    )

    const payoutAsset$ = payoutAssetAddressChanged$.pipe(
      switchMap(address => /^0x[a-fA-F0-9]{40}$/.test(address) ?
        this.erc20Service.getData(address).pipe(
          catchError(() => of(undefined)),
        ) : of(undefined),
      ),
    )

    this.distributeState$ = payoutAsset$.pipe(
      switchMap(tokenData => !!tokenData ? combineLatest([
        of(tokenData),
        this.assetService.getAssetWithInfo(tokenData.address, true).pipe(
          catchError(() => of(undefined)),
        ),
        this.erc20Service.getAllowance$(
          tokenData.address, this.preferenceQuery.network.tokenizerConfig.payoutManager,
        ),
        this.erc20Service.tokenBalance$(tokenData.address),
      ]).pipe(
        map(([tokenData, asset, allowance, balance]) => ({tokenData, asset, allowance, balance})),
      ) : of(undefined)),
      shareReplay(1),
    )

    this.shouldApprove$ = combineLatest([
      this.distributeState$,
      tokenAmountChanged$,
    ]).pipe(
      map(([state, tokenAmount]) => {
        if (!state?.balance) return false

        const amount = this.conversion.toToken(
          tokenAmount || 0, state.tokenData.decimals,
        )

        if (state.balance.lt(amount)) return false

        return state.allowance.lt(amount)
      }),
      distinctUntilChanged(),
    )

    this.shouldDistribute$ = combineLatest([
      this.shouldApprove$,
    ]).pipe(
      map(([shouldApprove]) => {
        return !shouldApprove
      }),
      distinctUntilChanged(),
    )
  }

  private amountValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return combineLatest([this.distributeState$]).pipe(take(1),
      map(([data]) => {
        if (!data) return {noToken: true}

        const tokenAmount = this.conversion.toToken(control.value.tokenAmount || 0, data.tokenData.decimals)

        if (tokenAmount.lte(constants.Zero)) {
          return {tokenAmountBelowZero: true}
        } else if (tokenAmount.gt(data.balance!)) {
          return {tokenAmountAboveBalance: true}
        }

        return null
      }),
      tap(() => ɵmarkDirty(this)),
    )
  }

  approveAmount(state: DistributeState) {
    return () => {
      const amount = this.conversion.toToken(
        this.sendAssetForm.value.tokenAmount, state.tokenData.decimals,
      )

      return this.erc20Service.approveAmount(
        state.tokenData.address,
        this.preferenceQuery.network.tokenizerConfig.payoutManager,
        amount,
      )
    }
  }

  createPayout(state: DistributeState, payout: Payout) {
    return () => {
      return this.payoutManagerService.createPayout({
          asset: payout.asset,
          totalAssetAmount: payout.total_asset_amount,
          ignoredAssetAddresses: payout.ignored_holder_addresses,
          payoutInfo: payout.payout_info || '',
          assetSnapshotMerkleRoot: payout.asset_snapshot_merkle_root,
          assetSnapshotMerkleDepth: payout.asset_snapshot_merkle_depth,
          assetSnapshotBlockNumber: payout.asset_snapshot_block_number,
          assetSnapshotMerkleIpfsHash: payout.asset_snapshot_merkle_ipfs_hash,
          rewardAsset: state.tokenData.address,
          totalRewardAmount: this.conversion.toToken(
            this.sendAssetForm.value.tokenAmount, state.tokenData.decimals,
          ),
        },
      )
    }
  }
}

interface DistributeState {
  tokenData: ERC20TokenData,
  asset: CommonAssetWithInfo | undefined,
  allowance: BigNumber,
  balance: BigNumber | undefined,
}
