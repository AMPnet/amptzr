import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {utils} from 'ethers'
import {concatMap, map, switchMap, tap} from 'rxjs/operators'
import {BehaviorSubject, combineLatest, EMPTY, Observable, of} from 'rxjs'
import {VenlySubsignerService} from '../shared/services/subsigners/venly-subsigner.service'
import {AuthProvider} from '../preference/state/preference.store'
import {withStatus} from '../shared/utils/observables'
import {USDC__factory} from '../../../types/ethers-contracts'
import {TokenMappingService} from '../shared/services/token-mapping.service'
import {RouterService} from '../shared/services/router.service'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {
  authProviderType = AuthProvider
  transactionType = TransactionType

  authProvider$ = this.sessionQuery.authProvider$

  userIdentitySub = new BehaviorSubject<string>('John Smith')
  userIdentity$ = this.userIdentitySub.asObservable()

  address$ = this.sessionQuery.address$.pipe(
    tap(() => ɵmarkDirty(this)),
  )

  paymentTokenBalance$ = combineLatest([this.sessionQuery.provider$, this.sessionQuery.address$]).pipe(
    switchMap(([provider, address]) => withStatus(
      of(USDC__factory.connect(this.tokenMappingService.usdc, provider)).pipe(
        concatMap(usdc => usdc.balanceOf(address!)),
        map(value => utils.formatEther(value)),
        tap(() => ɵmarkDirty(this)),
      ),
    )),
  )

  // TODO: base currency balance will probably be used here in the future for gas indicator.
  // nativeTokenBalance$ = combineLatest([this.sessionQuery.provider$, this.sessionQuery.address$]).pipe(
  //   switchMap(([provider, address]) => withStatus(
  //     from(provider.getBalance(address!)).pipe(
  //       map(value => utils.formatEther(value)),
  //     ),
  //   )),
  // )

  transactionHistory: WalletTransaction[] = [ // TODO: used for testing only
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
              private router: RouterService) {
  }

  logout(): Observable<unknown> {
    return this.signerService.logout().pipe(
      tap(() => this.router.navigate(['/'])),
    )
  }

  manageVenlyWallets(): Observable<unknown> {
    return this.venly.manageWallets().pipe(
      concatMap(res => res ? this.signerService.login(this.venly, {force: false}) : EMPTY),
    )
  }
}

enum TransactionType {
  Investment = 'Investment',
  DividendPayout = 'Dividend Payout'
}

interface WalletTransaction {
  type: TransactionType
  projectName: string
  amount: number
}
