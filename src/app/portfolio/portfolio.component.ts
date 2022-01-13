import {ChangeDetectionStrategy, Component} from '@angular/core'
import {withInterval, withStatus} from '../shared/utils/observables'
import {PortfolioItem, QueryService} from '../shared/services/blockchain/query.service'
import {distinctUntilChanged, map, shareReplay, switchMap, tap} from 'rxjs/operators'
import {BehaviorSubject, combineLatest, Observable, of, takeWhile} from 'rxjs'
import {DialogService} from '../shared/services/dialog.service'
import {StablecoinBigNumber, StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {CampaignService, CampaignWithInfo} from '../shared/services/blockchain/campaign/campaign.service'
import {CampaignFlavor} from '../shared/services/blockchain/flavors'
import {BigNumber, constants} from 'ethers'
import {AutoInvestService} from '../shared/services/backend/auto-invest.service'
import {AssetService, CommonAssetWithInfo} from '../shared/services/blockchain/asset/asset.service'
import {ConversionService} from '../shared/services/conversion.service'
import {TokenBigNumber} from '../shared/utils/token'
import {PreferenceQuery} from '../preference/state/preference.query'

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioComponent {
  portfolioSub = new BehaviorSubject<void>(undefined)

  portfolio$: Observable<PortfolioItemView[]> = combineLatest([
    this.portfolioSub.asObservable(),
    this.preferenceQuery.address$,
    this.stablecoin.balance$,
  ]).pipe(
    switchMap(() => this.queryService.portfolio$),
    switchMap(portfolio => portfolio.length > 0 ? combineLatest(
      portfolio.map(item => this.campaignService.getCampaignInfo(item.campaign).pipe(
        switchMap(campaign => this.getCampaignWithAsset(campaign)),
        map(campaignWithAsset => ({...item, ...campaignWithAsset})),
      )),
    ) : of([])),
    shareReplay({bufferSize: 1, refCount: true}),
  )
  portfolioWithStatus$ = withStatus(this.portfolio$)

  totalInvested$: Observable<{ value: StablecoinBigNumber }> = this.portfolio$.pipe(
    map(portfolio => portfolio.length > 0 ?
      portfolio.map(item => item.tokenValue).reduce((prev, curr) => prev.add(curr)) : constants.Zero),
    map(v => ({value: v})),
  )

  pending$: Observable<PendingItem | undefined> = combineLatest([
    this.preferenceQuery.address$,
    this.stablecoin.balance$,
  ]).pipe(
    switchMap(([address, _balance]) => withInterval(this.autoInvestService.status(address || ''), 8000)),
    map(res => res.auto_invests),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    switchMap(items => items.length > 0 ? of(items[0]).pipe(
      map(item => ({...item, amount: BigNumber.from(item.amount)})),
      switchMap(item => this.campaignService.getCampaignWithInfo(item.campaign_address).pipe(
        switchMap(campaign => combineLatest([
          this.getCampaignWithAsset(campaign),
          this.stablecoin.getAllowance$(campaign.contractAddress).pipe(
            map(allowance => allowance.gte(item.amount)),
            takeWhile(enoughAllowance => !enoughAllowance, true),
          ),
          this.stablecoin.balance$.pipe(
            map(balance => !!balance?.gte(item.amount)),
            takeWhile(enoughBalance => !enoughBalance, true),
          ),
        ])),
        map(([campaignWithAsset, enoughAllowance, enoughBalance]) => ({
          campaign: campaignWithAsset.campaign,
          asset: campaignWithAsset.asset,
          enoughAllowance,
          enoughBalance,
          tokenValue: item.amount,
          tokenAmount: this.conversion.calcTokens(item.amount, campaignWithAsset.campaign.pricePerToken),
        })),
      )),
    ) : of(undefined)),
  )

  constructor(private preferenceQuery: PreferenceQuery,
              private queryService: QueryService,
              private dialogService: DialogService,
              public stablecoin: StablecoinService,
              private autoInvestService: AutoInvestService,
              private conversion: ConversionService,
              private campaignService: CampaignService,
              private assetService: AssetService) {
  }

  cancel(contractAddress: string, flavor: CampaignFlavor | string) {
    return () => {
      return this.dialogService.withPermission({
        message: 'If you cancel the investment, somebody could take your place in the campaign.',
        confirmText: 'Proceed',
      }).pipe(
        switchMap(() => this.campaignService.cancelInvestment(contractAddress, flavor as CampaignFlavor)),
        switchMap(() => this.dialogService.success({
          title: 'Investment has been cancelled',
        })),
        tap(() => this.portfolioSub.next()),
      )
    }
  }

  approveFunds(campaignAddress: string, amount: StablecoinBigNumber) {
    return () => {
      return this.stablecoin.approveAmount(campaignAddress, amount)
    }
  }

  private getCampaignWithAsset(campaign: CampaignWithInfo) {
    return this.assetService.getAssetWithInfo(campaign.asset).pipe(
      map(asset => ({campaign, asset})),
    )
  }
}

interface PortfolioItemView extends PortfolioItem {
  campaign: CampaignWithInfo;
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
