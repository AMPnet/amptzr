import { ChangeDetectionStrategy, Component, ɵmarkDirty } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { PayoutService } from '../../../shared/services/backend/payout.service'
import { RouterService } from '../../../shared/services/router.service'
import { ActivatedRoute } from '@angular/router'
import { DialogService } from '../../../shared/services/dialog.service'
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  from,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs'
import { SessionQuery } from '../../../session/state/session.query'
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  take,
} from 'rxjs/operators'
import {
  Erc20Service,
  ERC20TokenData,
} from '../../../shared/services/blockchain/erc20.service'
import { BlockTimePipe } from '../../../shared/pipes/block-time.pipe'
import { PreferenceQuery } from '../../../preference/state/preference.query'

@Component({
  selector: 'app-snapshot-new',
  templateUrl: './snapshot-new.component.html',
  styleUrls: ['./snapshot-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapshotNewComponent {
  newSnapshotForm: FormGroup
  ignoredAddressInputForm: FormGroup
  state$: Observable<NewSnapshotState>

  formFinishedLoadingSub = new BehaviorSubject(true)

  constructor(
    private payoutService: PayoutService,
    private fb: FormBuilder,
    private router: RouterService,
    private route: ActivatedRoute,
    private blockTimePipe: BlockTimePipe,
    private erc20Service: Erc20Service,
    private sessionQuery: SessionQuery,
    private preferenceQuery: PreferenceQuery,
    private dialogService: DialogService
  ) {
    this.newSnapshotForm = this.fb.group({
      assetAddress: ['', Validators.required, [this.assetValidator.bind(this)]],
      ignoredHolderAddresses: [[]],
      excludeMyself: [true],
      blockNumber: [
        '',
        [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)],
        [this.blockNumberValidator.bind(this)],
      ],
    })

    this.ignoredAddressInputForm = this.fb.group({
      holderAddress: [
        '',
        [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)],
      ],
    })

    const assetAddressChanged$ = this.newSnapshotForm
      .get('assetAddress')!
      .valueChanges.pipe(
        startWith(this.newSnapshotForm.value.assetAddress),
        distinctUntilChanged(),
        shareReplay(1)
      )

    const asset$ = assetAddressChanged$.pipe(
      switchMap((address) =>
        /^0x[a-fA-F0-9]{40}$/.test(address)
          ? this.erc20Service
              .getData(address)
              .pipe(catchError(() => of(undefined)))
          : of(undefined)
      ),
      shareReplay(1)
    )

    const blockNumber$: Observable<string> = this.newSnapshotForm
      .get('blockNumber')!
      .valueChanges.pipe(
        startWith(this.newSnapshotForm.value.blockNumber),
        distinctUntilChanged((p, c) => p == c),
        shareReplay(1)
      )

    const blockTime$: Observable<number | undefined> = blockNumber$.pipe(
      concatMap((blockNumber) => this.blockTimePipe.transform(blockNumber)),
      shareReplay(1)
    )

    this.state$ = combineLatest([asset$, blockTime$]).pipe(
      map(([tokenData, blockTime]) => ({ tokenData, blockTime })),
      shareReplay(1)
    )
  }

  private assetValidator(
    _control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return combineLatest([this.state$]).pipe(
      debounceTime(100),
      take(1),
      map(([data]) => (!data.tokenData ? { noToken: true } : null)),
      tap(() => ɵmarkDirty(this))
    )
  }

  private blockNumberValidator(
    _control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return combineLatest([this.state$]).pipe(
      debounceTime(100),
      take(1),
      map(([data]) =>
        !data.blockTime ? { incorrectBlockNumber: true } : null
      ),
      tap(() => ɵmarkDirty(this))
    )
  }

  createPayout() {
    if (this.newSnapshotForm.value.excludeMyself) {
      this.appendIgnoredHolder(this.preferenceQuery.getValue().address)
    }

    return this.payoutService
      .createSnapshot(
        this.newSnapshotForm.value.assetAddress,
        this.newSnapshotForm.value.ignoredHolderAddresses
      )
      .pipe(
        switchMap(() =>
          this.dialogService.success({
            message: 'Payout snapshot requested.',
          })
        )
      )
  }

  setCurrentBlockNumber() {
    return from(this.sessionQuery.provider.getBlockNumber()).pipe(
      tap((blockNumber) => {
        this.newSnapshotForm
          .get('blockNumber')
          ?.setValue((blockNumber - 1).toString())
      }),
      tap(() => ɵmarkDirty(this))
    )
  }

  appendIgnoredHolder(address: string) {
    if (this.newSnapshotForm.value.ignoredHolderAddresses.includes(address))
      return

    this.newSnapshotForm.value.ignoredHolderAddresses.push(address)
  }

  addIgnoredHolderFromInput() {
    const address = this.ignoredAddressInputForm.value.holderAddress
    this.ignoredAddressInputForm.get('holderAddress')?.setValue('')

    this.appendIgnoredHolder(address)
  }

  removeIgnoredHolder(removeAddress: string) {
    const addresses: string[] =
      this.newSnapshotForm.value.ignoredHolderAddresses

    this.newSnapshotForm
      .get('ignoredHolderAddresses')
      ?.setValue(
        addresses.filter((address: string) => address !== removeAddress)
      )
  }
}

interface NewSnapshotState {
  tokenData: ERC20TokenData | undefined
  blockTime: number | undefined
}
