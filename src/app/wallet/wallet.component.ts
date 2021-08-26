import {ChangeDetectionStrategy, Component} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {concatMap, delay, finalize, map} from 'rxjs/operators'
import {BehaviorSubject, EMPTY, Observable} from 'rxjs'
import {VenlySubsignerService} from '../shared/services/subsigners/venly-subsigner.service'
import {AuthProvider} from '../preference/state/preference.store'
import {WithStatus, withStatus} from '../shared/utils/observables'
import {RouterService} from '../shared/services/router.service'
import {StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {UserService} from '../shared/services/user.service'
import {
  ReportService,
  Transaction,
  TransactionHistory,
  TransactionType
} from '../shared/services/backend/report.service'
import {CampaignService} from '../shared/services/blockchain/campaign.service'
import {BigNumber} from 'ethers'

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

  address$ = this.sessionQuery.address$

  balance$ = withStatus(this.stablecoinService.balance$)

  transactionHistory$: Observable<WithStatus<TransactionHistory & CampaignNames>>

  // TODO: base currency balance will probably be used here in the future for gas indicator.
  // nativeTokenBalance$ = combineLatest([this.sessionQuery.provider$, this.sessionQuery.address$]).pipe(
  //   switchMap(([provider, address]) => withStatus(
  //     from(provider.getBalance(address!)).pipe(
  //       map(value => utils.formatEther(value)),
  //     ),
  //   )),
  // )

  constructor(private sessionQuery: SessionQuery,
              private signerService: SignerService,
              private stablecoinService: StablecoinService,
              private userService: UserService,
              private reportService: ReportService,
              private campaignService: CampaignService,
              private venly: VenlySubsignerService,
              private router: RouterService) {
    this.transactionHistory$ = withStatus(
      // TODO fetch actual txHistory here:
      //  this.reportService.transactionHistory()
      this.mockTransactionHistory()
        .pipe(
          map(txHistory => {
            return {campaignNames$: txHistory.transactions.map(this.transactionCampaignName.bind(this)), ...txHistory}
          })
        )
    )
  }

  logout() {
    this.userService.logout().pipe(
      finalize(() => this.router.navigate(['/'])),
    ).subscribe()
  }

  manageVenlyWallets(): Observable<unknown> {
    return this.venly.manageWallets().pipe(
      concatMap(res => res ? this.signerService.login(this.venly, {force: false}) : EMPTY),
    )
  }

  downloadTransactionHistory() {
    this.reportService.downloadTransactionHistoryReport().subscribe()
  }

  isOutgoingTransaction(transaction: Transaction) {
    return transaction.type === TransactionType.INVEST || transaction.type === TransactionType.FINALIZE_INVEST
  }

  transactionValueSign(transaction: Transaction) {
    if (this.isOutgoingTransaction(transaction)) {
      return "-"
    }

    return "+"
  }

  private transactionCampaignName(transaction: Transaction): Observable<WithStatus<string>> {
    const campaignAddress = this.isOutgoingTransaction(transaction) ? transaction.to_address : transaction.from_address
    return withStatus(
      this.campaignService.getCampaignWithInfo(campaignAddress)
        .pipe(map((campaign) => {
          return campaign.name
        }))
    )
  }

  private mockTransactionHistory(): Observable<TransactionHistory> { // TODO mock txHistory, remove later
    return this.address$.pipe(
      map((address) => {
        return {
          transactions: [
            {
              from_address: address!,
              to_address: '0xCa968a945c766cD4144FefF7f8D314399Fe7D818',
              chain_id: 80001,
              hash: 'txHash',
              type: TransactionType.INVEST,
              asset: '0xBcC761b79b53d10Cdd70aE7F6Afc512dC15A0941', // asset contract address (ERC20)
              timestamp: 1629960623,
              token_amount: BigNumber.from("1000000000000000000"), // amount of campaign tokens given, wei format, this should be 1 token
              token_value: BigNumber.from("1000000000000000000"), // dollars in wei format, this should be $1
              payout_id: 0,
              revenue: 0
            },
            {
              from_address: address!,
              to_address: '0xCa968a945c766cD4144FefF7f8D314399Fe7D818',
              chain_id: 80001,
              hash: 'txHash',
              type: TransactionType.FINALIZE_INVEST,
              asset: '0xBcC761b79b53d10Cdd70aE7F6Afc512dC15A0941',
              timestamp: 1629960623,
              token_amount: BigNumber.from("1000000000000000000"),
              token_value: BigNumber.from("1000000000000000000"),
              payout_id: 0,
              revenue: 0
            },
            {
              from_address: '0xca25DC30b70dCc6326cE1ffBF9CeeE8C8c8000eA',
              to_address: address!,
              chain_id: 80001,
              hash: 'txHash',
              type: TransactionType.CANCEL_INVEST,
              asset: '0x9CDCB01F8833EDa34A31Ce44C2345d6FBEE3BA9B',
              timestamp: 1629960623,
              token_amount: BigNumber.from("1000000000000000000"),
              token_value: BigNumber.from("1000000000000000000"),
              payout_id: 0,
              revenue: 0
            },
            {
              from_address: '0xca25DC30b70dCc6326cE1ffBF9CeeE8C8c8000eA',
              to_address: address!,
              chain_id: 80001,
              hash: 'txHash',
              type: TransactionType.REVENUE_CLAIM,
              asset: '0x9CDCB01F8833EDa34A31Ce44C2345d6FBEE3BA9B',
              timestamp: 1629960623,
              token_amount: BigNumber.from("1000000000000000000"),
              token_value: BigNumber.from("1000000000000000000"),
              payout_id: 0,
              revenue: 0
            }
          ]
        }
      }),
      delay(2000)
    )
  }
}

interface CampaignNames {
  campaignNames$: Observable<WithStatus<string>>[]
}
