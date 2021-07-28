import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {utils} from 'ethers'
import {catchError, concatMap, map, switchMap, take, tap, timeout} from 'rxjs/operators'
import {combineLatest, EMPTY, from, Observable, of} from 'rxjs'
import {DialogService} from '../shared/services/dialog.service'
import {VenlySubsignerService} from '../shared/services/subsigners/venly-subsigner.service'
import {AuthProvider} from '../preference/state/preference.store'
import {withInterval, withStatus} from '../shared/utils/observables'
import {USDC__factory} from '../../../types/ethers-contracts'
import {TokenMappingService} from '../shared/services/token-mapping.service'
import {Router} from '@angular/router'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {
  authProvider = AuthProvider
  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  gas$ = this.sessionQuery.provider$.pipe(
    switchMap(provider => withStatus(
      withInterval(of(provider), 5000).pipe(
        concatMap(provider => from(provider.getGasPrice()).pipe(
          timeout(3000),
          catchError(() => EMPTY),
        )),
        map(gasRaw => utils.formatEther(gasRaw)),
      ))),
  )

  blockNumber$ = this.sessionQuery.provider$.pipe(
    switchMap(provider => withStatus(
      withInterval(of(provider), 2000).pipe(
        switchMap(provider => from(provider.getBlockNumber()).pipe(
          timeout(1800),
          catchError(() => EMPTY),
        )),
      ))),
  )

  address$ = this.sessionQuery.address$.pipe(
    tap(() => ɵmarkDirty(this)),
  )

  balanceUSDC$ = combineLatest([this.sessionQuery.provider$, this.sessionQuery.address$]).pipe(
    switchMap(([provider, address]) => withStatus(
      of(USDC__factory.connect(this.tokenMappingService.usdc, provider)).pipe(
        concatMap(usdc => usdc.balanceOf(address!)),
        map(value => utils.formatEther(value)),
      ),
    )),
  )

  balanceMATIC$ = combineLatest([this.sessionQuery.provider$, this.sessionQuery.address$]).pipe(
    switchMap(([provider, address]) => withStatus(
      from(provider.getBalance(address!)).pipe(
        map(value => utils.formatEther(value)),
      ),
    )),
  )

  authProvider$ = this.sessionQuery.authProvider$

  transactionHistory: WalletTransaction[] = [ // TODO used for testing only
    {
      type: TransactionType.INVESTMENT,
      projectName: 'Solarna elektrana Hvar',
      amount: 129,
    },
    {
      type: TransactionType.DIVIDEND_PAYOUT,
      projectName: 'Test project',
      amount: 505,
    },
    {
      type: TransactionType.INVESTMENT,
      projectName: 'LatCorp',
      amount: 420,
    },
  ]

  constructor(private sessionQuery: SessionQuery,
              private tokenMappingService: TokenMappingService,
              private signerService: SignerService,
              private venly: VenlySubsignerService,
              private router: Router,
              private dialogService: DialogService) {
  }

  logout(): Observable<unknown> {
    return this.signerService.logout().pipe(
      tap(() => this.router.navigate(['/'])),
    )
  }

  showCurrentGasPrice(): Observable<any> {
    return this.sessionQuery.provider$.pipe(
      take(1),
      concatMap(provider => from(provider.getGasPrice()).pipe(
        timeout(3000),
      )),
      map(gasRaw => utils.formatEther(gasRaw)),
      concatMap(gasPrice =>
        this.dialogService.info(`Current gas price is ${gasPrice}`, false)),
    )
  }

  manageWallets() {
    return this.venly.manageWallets().pipe(
      concatMap(res => res ? this.signerService.login(this.venly, {force: false}) : EMPTY),
    )
  }

  copyAddressToClipboard() {
    this.sessionQuery.address$.pipe(take(1))
      .subscribe(address => {
        const selBox = document.createElement('textarea')
        selBox.style.position = 'fixed'
        selBox.style.left = '0'
        selBox.style.top = '0'
        selBox.style.opacity = '0'
        selBox.value = address || ''
        document.body.appendChild(selBox)
        selBox.focus()
        selBox.select()
        document.execCommand('copy')
        document.body.removeChild(selBox)
        alert('Address copied to clipboard: ' + address) // TODO remove alert and use HTML instead
      })
  }
}

export enum TransactionType {
  INVESTMENT = 'INVESTMENT',
  DIVIDEND_PAYOUT = 'DIVIDEND_PAYOUT',
}

export interface WalletTransaction {
  type: TransactionType
  projectName: string
  amount: number
}
