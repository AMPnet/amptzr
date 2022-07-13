import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  withInterval,
  WithStatus,
  withStatus,
} from '../shared/utils/observables'
import {
  OrderItem,
  QueryService,
} from '../shared/services/blockchain/query.service'
import {
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators'
import { BehaviorSubject, combineLatest, Observable, of, takeWhile } from 'rxjs'
import { DialogService } from '../shared/services/dialog.service'
import {
  StablecoinBigNumber,
  StablecoinService,
} from '../shared/services/blockchain/stablecoin.service'
import {
  CampaignService,
  CampaignWithInfo,
} from '../shared/services/blockchain/campaign/campaign.service'
import { CampaignFlavor } from '../shared/services/blockchain/flavors'
import { BigNumber, constants } from 'ethers'
import { AutoInvestService } from '../shared/services/backend/auto-invest.service'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../shared/services/blockchain/asset/asset.service'
import { ConversionService } from '../shared/services/conversion.service'
import { TokenBigNumber } from '../shared/utils/token'
import { PreferenceQuery } from '../preference/state/preference.query'
import { Erc20Service } from '../shared/services/blockchain/erc20.service'

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent {
  ordersSub = new BehaviorSubject<void>(undefined)

  orders$: Observable<OrdersItemView[]> = combineLatest([
    this.ordersSub.asObservable(),
    this.preferenceQuery.address$,
    this.stablecoin.balance$,
  ]).pipe(
    switchMap(() => this.queryService.orders$),
    switchMap((orders) =>
      orders.length > 0
        ? combineLatest(
            orders.map((item) =>
              this.campaignService.getCampaignInfo(item.campaign).pipe(
                switchMap((campaign) => this.getCampaignWithAsset(campaign)),
                map((campaignWithAsset) => ({ ...item, ...campaignWithAsset }))
              )
            )
          )
        : of([])
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  )
  ordersWithStatus$ = withStatus(this.orders$)

  totalInvested$: Observable<{ value: StablecoinBigNumber }> =
    this.orders$.pipe(
      map((orders) =>
        orders.length > 0
          ? orders
              .map((item) => item.tokenValue)
              .reduce((prev, curr) => prev.add(curr))
          : constants.Zero
      ),
      map((v) => ({ value: v }))
    )

  pending$: Observable<WithStatus<PendingItem> | undefined> = combineLatest([
    this.preferenceQuery.address$,
    this.stablecoin.balance$,
  ]).pipe(
    switchMap(([address, _balance]) =>
      withInterval(this.autoInvestService.status(address || ''), 8000)
    ),
    map((res) => res.auto_invests),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
    ),
    switchMap((items) =>
      items.length > 0
        ? of(items[0]).pipe(
            map((item) => ({ ...item, amount: BigNumber.from(item.amount) })),
            switchMap((item) =>
              withStatus(
                this.campaignService
                  .getCampaignWithInfo(item.campaign_address)
                  .pipe(
                    switchMap((campaign) =>
                      combineLatest([
                        this.getCampaignWithAsset(campaign),
                        this.erc20Service
                          .getAllowance$(
                            campaign.stablecoin,
                            campaign.contractAddress
                          )
                          .pipe(
                            map((allowance) => allowance.gte(item.amount)),
                            takeWhile(
                              (enoughAllowance) => !enoughAllowance,
                              true
                            )
                          ),
                        this.stablecoin.balance$.pipe(
                          map((balance) => !!balance?.gte(item.amount)),
                          takeWhile((enoughBalance) => !enoughBalance, true)
                        ),
                      ])
                    ),
                    map(
                      ([
                        campaignWithAsset,
                        enoughAllowance,
                        enoughBalance,
                      ]) => ({
                        campaign: campaignWithAsset.campaign,
                        asset: campaignWithAsset.asset,
                        enoughAllowance,
                        enoughBalance,
                        tokenValue: item.amount,
                        tokenAmount: this.conversion.calcTokens(
                          item.amount,
                          campaignWithAsset.campaign.pricePerToken
                        ),
                      })
                    )
                  )
              )
            )
          )
        : of(undefined)
    )
  )

  constructor(
    private preferenceQuery: PreferenceQuery,
    private queryService: QueryService,
    private dialogService: DialogService,
    public stablecoin: StablecoinService,
    private erc20Service: Erc20Service,
    private autoInvestService: AutoInvestService,
    private conversion: ConversionService,
    private campaignService: CampaignService,
    private assetService: AssetService
  ) {}

  cancel(contractAddress: string, flavor: CampaignFlavor | string) {
    return () => {
      return this.dialogService
        .withPermission({
          icon: '/assets/dialog-icons/cancel-investment.png',
          title: 'Cancel investment',
          message:
            'If you cancel the investment, somebody could take your place in the campaign.',
          confirmText: 'Proceed',
        })
        .pipe(
          switchMap(() =>
            this.campaignService.cancelInvestment(
              contractAddress,
              flavor as CampaignFlavor
            )
          ),
          switchMap(() =>
            this.dialogService.success({
              message: 'Investment has been cancelled.',
            })
          ),
          tap(() => this.ordersSub.next())
        )
    }
  }

  approveFunds(campaign: CampaignWithInfo, amount: StablecoinBigNumber) {
    return () => {
      return this.erc20Service.approveAmount(
        campaign.stablecoin,
        campaign.contractAddress,
        amount
      )
    }
  }

  private getCampaignWithAsset(campaign: CampaignWithInfo) {
    return this.assetService
      .getAssetWithInfo(campaign.asset)
      .pipe(map((asset) => ({ campaign, asset })))
  }
}

interface OrdersItemView extends OrderItem {
  campaign: CampaignWithInfo
  asset: CommonAssetWithInfo
}

interface PendingItem {
  campaign: CampaignWithInfo
  asset: CommonAssetWithInfo
  enoughAllowance: boolean
  enoughBalance: boolean
  tokenAmount: StablecoinBigNumber
  tokenValue: TokenBigNumber
}
