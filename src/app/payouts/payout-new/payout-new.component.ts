import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {BehaviorSubject, combineLatest, Observable, of, switchMap} from 'rxjs'
import {withStatus, WithStatus} from '../../shared/utils/observables'
import {PayoutService, Snapshot, SnapshotStatus} from '../../shared/services/backend/payout.service'
import {ActivatedRoute} from '@angular/router'
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms'
import {catchError, distinctUntilChanged, map, shareReplay, startWith, take, tap} from 'rxjs/operators'
import {Erc20Service, ERC20TokenData} from '../../shared/services/blockchain/erc20.service'
import {AssetService, CommonAssetWithInfo} from '../../shared/services/blockchain/asset/asset.service'
import {BigNumber, constants} from 'ethers'
import {PayoutManagerService} from '../../shared/services/blockchain/payout-manager.service'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {ConversionService} from '../../shared/services/conversion.service'
import {DialogService} from '../../shared/services/dialog.service'
import {RouterService} from '../../shared/services/router.service'

@Component({
  selector: 'app-payout-new',
  templateUrl: './payout-new.component.html',
  styleUrls: ['./payout-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutNewComponent {
  snapshot$: Observable<WithStatus<Snapshot>>
  refreshSnapshotSub = new BehaviorSubject<void>(undefined)
  snapshotStatus = SnapshotStatus

  newPayoutForm: FormGroup

  payoutState$: Observable<PayoutState | undefined>
  shouldApprove$: Observable<boolean>
  shouldCreatePayout$: Observable<boolean>

  constructor(private payoutService: PayoutService,
              private fb: FormBuilder,
              private erc20Service: Erc20Service,
              private assetService: AssetService,
              private payoutManagerService: PayoutManagerService,
              private preferenceQuery: PreferenceQuery,
              private conversion: ConversionService,
              private dialogService: DialogService,
              private router: RouterService,
              private route: ActivatedRoute) {
    const snapshotID = this.route.snapshot.params.snapshotID

    this.snapshot$ = withStatus(
      this.refreshSnapshotSub.asObservable().pipe(
        switchMap(() => this.payoutService.getSnapshot(snapshotID)),
      ),
    )

    this.newPayoutForm = this.fb.group({
      rewardAssetAddress: [
        '',
        [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)],
      ],
      tokenAmount: [''],
    }, {
      asyncValidators: this.amountValidator.bind(this),
    })

    const rewardAssetAddressChanged$ = this.newPayoutForm.get('rewardAssetAddress')!.valueChanges.pipe(
      startWith(this.newPayoutForm.value.rewardAssetAddress),
      distinctUntilChanged(),
      shareReplay(1),
    )

    const tokenAmountChanged$ = this.newPayoutForm.get('tokenAmount')!.valueChanges.pipe(
      startWith(this.newPayoutForm.value.tokenAmount),
      distinctUntilChanged((p, c) => p == c),
      shareReplay(1),
    )

    const rewardAsset$ = rewardAssetAddressChanged$.pipe(
      switchMap(address => /^0x[a-fA-F0-9]{40}$/.test(address) ?
        this.erc20Service.getData(address).pipe(
          catchError(() => of(undefined)),
        ) : of(undefined),
      ),
    )

    this.payoutState$ = rewardAsset$.pipe(
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
      this.payoutState$,
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

    this.shouldCreatePayout$ = combineLatest([
      this.shouldApprove$,
    ]).pipe(
      map(([shouldApprove]) => {
        return !shouldApprove
      }),
      distinctUntilChanged(),
    )
  }

  private amountValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return combineLatest([this.payoutState$]).pipe(take(1),
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

  approveAmount(state: PayoutState) {
    return () => {
      const amount = this.conversion.toToken(
        this.newPayoutForm.value.tokenAmount, state.tokenData.decimals,
      )

      return this.erc20Service.approveAmount(
        state.tokenData.address,
        this.preferenceQuery.network.tokenizerConfig.payoutManager,
        amount,
      )
    }
  }

  createPayout(state: PayoutState, snapshot: Snapshot) {
    return () => {
      return this.payoutManagerService.createPayout({
          asset: snapshot.asset,
          totalAssetAmount: snapshot.total_asset_amount,
          ignoredAssetAddresses: snapshot.ignored_holder_addresses,
          payoutInfo: '', // TODO: set payout info from the user form input
          assetSnapshotMerkleRoot: snapshot.asset_snapshot_merkle_root,
          assetSnapshotMerkleDepth: snapshot.asset_snapshot_merkle_depth,
          assetSnapshotBlockNumber: snapshot.asset_snapshot_block_number,
          assetSnapshotMerkleIpfsHash: snapshot.asset_snapshot_merkle_ipfs_hash,
          rewardAsset: state.tokenData.address,
          totalRewardAmount: this.conversion.toToken(
            this.newPayoutForm.value.tokenAmount, state.tokenData.decimals,
          ),
        },
      ).pipe(
        switchMap(() => this.dialogService.success({
          message: 'Payout created.',
        })),
        switchMap(() => this.router.navigate(['../..'], {relativeTo: this.route})),
      )
    }
  }
}

interface PayoutState {
  tokenData: ERC20TokenData,
  asset: CommonAssetWithInfo | undefined,
  allowance: BigNumber,
  balance: BigNumber | undefined,
}
