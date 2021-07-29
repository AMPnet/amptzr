import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {utils} from 'ethers'
import {catchError, concatMap, delay, filter, map, switchMap, take, tap, timeout} from 'rxjs/operators'
import {BehaviorSubject, combineLatest, EMPTY, from, Observable, of} from 'rxjs'
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
  transactionType = TransactionType

  copyLabelSub = new BehaviorSubject<string>("Copy")
  
  copyLabel$ = this.copyLabelSub.asObservable()

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
      type: TransactionType.Investment,
      projectName: 'Solarna elektrana Hvar',
      amount: 129,
    },
    {
      type: TransactionType.DividendPayout,
      projectName: 'Test project',
      amount: 30255,
    },
    {
      type: TransactionType.Investment,
      projectName: 'LatCorp',
      amount: -2230,
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
        
        this.copyLabelSub.next("Copied")
        setTimeout(() => { this.copyLabelSub.next("Copy") }, 2000)
      })
  }
}

export enum TransactionType {
  Investment = "Investment",
  DividendPayout = "Dividend Payout"
}

export interface WalletTransaction {
  type: TransactionType
  projectName: string
  amount: number
}
