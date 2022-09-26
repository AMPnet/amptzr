import { BrowserModule } from '@angular/platform-browser'
import { APP_INITIALIZER, NgModule } from '@angular/core'
import { combineLatest } from 'rxjs'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { NG_ENTITY_SERVICE_CONFIG } from '@datorama/akita-ng-entity-service'
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools'
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store'
import { environment } from '../environments/environment'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { OffersComponent } from './offers/offers.component'
import { MatDialogModule } from '@angular/material/dialog'
import { OrdersComponent } from './orders/orders.component'
import { WalletComponent } from './wallet/wallet.component'
import { ActionButtonComponent } from './shared/components/action-button/action-button.component'
import { AddrShortPipe } from './shared/pipes/addr-short.pipe'
import { InfoDialogComponent } from './shared/components/info-dialog/info-dialog.component'
import { DevPlaygroundComponent } from './shared/components/dev-playground/dev-playground.component'
import { PreferenceService } from './preference/state/preference.service'
import { AppLayoutComponent } from './app-layout/app-layout.component'
import { NavbarComponent } from './app-layout/navbar/navbar.component'
import { FooterComponent } from './app-layout/footer/footer.component'
import { A11yModule } from '@angular/cdk/a11y'
import { SpinnerComponent } from './shared/components/spinner/spinner.component'
import { ServiceWorkerModule } from '@angular/service-worker'
import { InlineAsyncComponent } from './shared/components/inline-async/inline-async.component'
import { UnwrapStatusPipe } from './shared/pipes/unwrap-status.pipe'
import { OfferComponent } from './offer/offer.component'
import { DepositComponent } from './deposit/deposit.component'
import { InvestComponent } from './invest/invest.component'
import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  PercentPipe,
  ViewportScroller,
} from '@angular/common'
import { CurrencyDefaultPipe } from './shared/pipes/currency-default.pipe'
import { AuthComponent } from './auth/auth.component'
import { HttpClientModule } from '@angular/common/http'
import { VeriffComponent } from './identity/veriff/veriff.component'
import { FaqComponent } from './faq/faq.component'
import { FundingProgressComponent } from './shared/components/funding-progress/funding-progress.component'
import { AuthProviderNamePipe } from './shared/pipes/auth-provider-name.pipe'
import { ProfileAddMandatoryComponent } from './profile/profile-add-mandatory/profile-add-mandatory.component'
import { ReactiveFormsModule } from '@angular/forms'
import { CurrencyMaskDirective } from './shared/directives/currency-mask.directive'
import { ValueCopyComponent } from './shared/components/value-copy/value-copy.component'
import { FileInputAccessorDirective } from './shared/directives/file-input-accessor.directive'
import { SafePipe } from './shared/pipes/safe.pipe'
import { FormatUnitPipe } from './shared/pipes/format-unit.pipe'
import { ToTextIpfsPipe } from './shared/pipes/to-text-ipfs.pipe'
import { ToUrlIPFSPipe } from './shared/pipes/to-url-ipfs.pipe'
import { IssuerPathPipe } from './shared/pipes/issuer-path.pipe'
import { OffersCardComponent } from './offers/offers-card/offers-card.component'
import { WalletButtonComponent } from './app-layout/navbar/wallet-button/wallet-button.component'
import { FaqQuestionComponent } from './faq/faq-question/faq-question.component'
import { MatTooltipModule } from '@angular/material/tooltip'
import { DepositFlowComponent } from './deposit/deposit-flow/deposit-flow.component'
import { TruncatePipe } from './shared/pipes/truncate.pipe'
import { UnescapePipe } from './shared/pipes/unescape.pipe'
import { AppQuillModule } from './shared/modules/app-quill.module'
import { SelectNetworkComponent } from './shared/components/select-network/select-network.component'
import { HomeComponent } from './home/home.component'
import { GoogleTranslateComponent } from './shared/components/google-translate/google-translate.component'
import { PercentageMaskDirective } from './shared/directives/percentage-mask.directive'
import { OfferInvestmentInfoComponent } from './offer-investment-info/offer-investment-info.component'
import { Router, Scroll } from '@angular/router'
import { delay, filter } from 'rxjs/operators'
import { LoadingDialogComponent } from './shared/components/loading-dialog/loading-dialog.component'
import { WalletTxHistoryComponent } from './wallet/wallet-tx-history/wallet-tx-history.component'
import { WalletTxHistoryItemComponent } from './wallet/wallet-tx-history-item/wallet-tx-history-item.component'
import { AssetPathSegmentPipe } from './shared/pipes/asset-path-segment.pipe'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { AddButtonComponent } from './shared/components/add-button/add-button.component'
import { AdminIssuerAssetItemComponent } from './admin/admin-issuer-asset-item/admin-issuer-asset-item.component'
import { AdminIssuerEditComponent } from './admin/admin-issuer-edit/admin-issuer-edit.component'
import { AdminAssetDetailComponent } from './admin/admin-asset-detail/admin-asset-detail.component'
import { AdminCampaignItemComponent } from './admin/admin-campaign-item/admin-campaign-item.component'
import { AdminAssetEditComponent } from './admin/admin-asset-edit/admin-asset-edit.component'
import { AdminIssuerComponent } from './admin/admin-issuer/admin-issuer.component'
import { AdminAssetNewComponent } from './admin/admin-asset-new/admin-asset-new.component'
import { FormYesNoButtonsComponent } from './shared/components/form-yes-no-buttons/form-yes-no-buttons.component'
import { DateMaskDirective } from './shared/directives/date-mask.directive'
import { AdminCampaignEditComponent } from './admin/admin-campaign-edit/admin-campaign-edit.component'
import { AdminCampaignAddTokensComponent } from './admin/admin-campaign-add-tokens/admin-campaign-add-tokens.component'
import { AdminCampaignDetailComponent } from './admin/admin-campaign-detail/admin-campaign-detail.component'
import { AdminAssetCampaignNewComponent } from './admin/admin-asset-campaign-new/admin-asset-campaign-new.component'
import { AdminIssuerNewComponent } from './admin/admin-issuer-new/admin-issuer-new.component'
import { AdminIssuerEditCampaignVisibilityComponent } from './admin/admin-issuer-edit-campaign-visibility/admin-issuer-edit-campaign-visibility.component'
import { AdminIssuerEditCampaignVisibilityCardComponent } from './admin/admin-issuer-edit-campaign-visibility/admin-issuer-edit-campaign-visibility-card/admin-issuer-edit-campaign-visibility-card.component'
import { AddToMetamaskComponent } from './shared/components/add-to-metamask/add-to-metamask.component'
import { ExplorerLinkComponent } from './shared/components/explorer-link/explorer-link.component'
import { AuthMagicComponent } from './auth/auth-magic/auth-magic.component'
import { BigNumberInputDirective } from './shared/directives/bignumber-input.directive'
import { LoadingDialogApprovalComponent } from './shared/components/loading-dialog/loading-dialog-approval/loading-dialog-approval.component'
import { LoadingDialogTransactionComponent } from './shared/components/loading-dialog/loading-dialog-transaction/loading-dialog-transaction.component'
import { LoadingOverlayComponent } from './shared/components/loading-dialog/loading-overlay/loading-overlay.component'
import { DepositDialogComponent } from './deposit/deposit-dialog/deposit-dialog.component'
import { AuthMagicOauthComponent } from './auth/auth-magic-oauth/auth-magic-oauth.component'
import { TransferComponent } from './transfer/transfer.component'
import { ToStablecoinLogoPathPipe } from './shared/pipes/to-stablecoin-logo-path.pipe'
import { SwapComponent } from './swap/swap.component'
import { LazyImgDirective } from './shared/directives/lazy-img.directive'
import { AssetDataPipe } from './shared/pipes/asset-data.pipe'
import { WithStatusPipe } from './shared/pipes/with-status.pipe'
import { BlockTimePipe } from './shared/pipes/block-time.pipe'
import { PayoutsComponent } from './payouts/payouts.component'
import { SnapshotsComponent } from './payouts/snapshots/snapshots.component'
import { SnapshotNewComponent } from './payouts/snapshots/snapshot-new/snapshot-new.component'
import { SnapshotComponent } from './payouts/snapshots/snapshot/snapshot.component'
import { PayoutComponent } from './payouts/payout/payout.component'
import { PayoutNewComponent } from './payouts/payout-new/payout-new.component'
import { ClaimsComponent } from './payouts/claims/claims.component'
import { WrongNetworkComponent } from './shared/components/wrong-network/wrong-network.component'
import { RequestSendNewComponent } from './request-send/request-send-new/request-send-new.component'
import { RequestSendActionComponent } from './request-send/request-send-action/request-send-action.component'
import { RequestSendShowComponent } from './request-send/request-send-show/request-send-show.component'
import { RequestBalanceActionComponent } from './request-balance/request-balance-action/request-balance-action.component'
import { RequestWalletActionComponent } from './request-wallet/request-wallet-action/request-wallet-action.component'
import { DashboardHolderComponent } from './dashboard/dashboard-holder/dashboard-holder.component'
import { ContractsTableHolderComponent } from './dashboard/contracts-table-holder/contracts-table-holder.component'
import { ThirdPartyIntegrationsOverviewComponent } from './dashboard/utils/third-party-integrations-overview/third-party-integrations-overview.component'
import { ContractsComponent } from './dashboard/contracts/contracts.component'
import { AddressBookComponent } from './dashboard/address-book/address-book.component'
import { ApiKeyShortPipe } from './shared/pipes/api-key-short.pipe'
import { AirdropComponent } from './dashboard/airdrop/airdrop.component'
import { PaymentsComponent } from './payments/payments.component'
import { RequestSendListComponent } from './request-send/request-send-list/request-send-list.component'
import { InfoSnippetComponent } from './shared/components/info-snippet/info-snippet.component'
import { AuthorizationsComponent } from './dashboard/authorizations/authorizations.component'
import { AuthorizationNewComponent } from './dashboard/authorizations/authorization-new/authorization-new.component'
import { ContractDeployExecEnvComponent } from './execution-environments/contract-deploy-exec-env/contract-deploy-exec-env.component'
import { DeployFromManifestComponent } from './dashboard/contracts/deploy-from-manifest/deploy-from-manifest.component'
import { InteractWithContractsComponent } from './dashboard/contracts/interact-with-contracts/interact-with-contracts.component'
import { SmartInputComponent } from './shared/components/smart-input/smart-input.component'
import { ContractSmartInputComponent } from './shared/components/smart-input/contract-smart-input/contract-smart-input.component'
import { AddressSmartInputComponent } from './shared/components/smart-input/address-smart-input/address-smart-input.component'
import { DateTimeSmartInputComponent } from './shared/components/smart-input/date-time-smart-input/date-time-smart-input.component'
import { DurationSmartInputComponent } from './shared/components/smart-input/duration-smart-input/duration-smart-input.component'
import { ArraySmartInputComponent } from './shared/components/smart-input/array-smart-input/array-smart-input.component'
import { FunctionCallExecEnvComponent } from './dashboard/function-call-exec-env/function-call-exec-env.component'
import { WorkflowsComponent } from './dashboard/workflows/workflows.component'
import { ContractFunctionInteractionItemComponent } from './dashboard/contracts/contract-function-interaction-item/contract-function-interaction-item.component'
import { WorkflowActionItemComponent } from './dashboard/workflows/workflow-action-item/workflow-action-item.component'

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    OffersComponent,
    OrdersComponent,
    WalletComponent,
    ActionButtonComponent,
    AddrShortPipe,
    ApiKeyShortPipe,
    UnwrapStatusPipe,
    InfoDialogComponent,
    DevPlaygroundComponent,
    AppLayoutComponent,
    FooterComponent,
    SpinnerComponent,
    InlineAsyncComponent,
    AuthComponent,
    AuthMagicComponent,
    OfferComponent,
    DepositComponent,
    InvestComponent,
    OffersCardComponent,
    FundingProgressComponent,
    CurrencyDefaultPipe,
    VeriffComponent,
    FaqComponent,
    AuthProviderNamePipe,
    ToUrlIPFSPipe,
    ToStablecoinLogoPathPipe,
    SafePipe,
    FormatUnitPipe,
    ToTextIpfsPipe,
    IssuerPathPipe,
    ProfileAddMandatoryComponent,
    CurrencyMaskDirective,
    ValueCopyComponent,
    AddToMetamaskComponent,
    ExplorerLinkComponent,
    FileInputAccessorDirective,
    LazyImgDirective,
    WalletButtonComponent,
    FaqQuestionComponent,
    DepositFlowComponent,
    TruncatePipe,
    UnescapePipe,
    AssetPathSegmentPipe,
    AssetDataPipe,
    WithStatusPipe,
    BlockTimePipe,
    SelectNetworkComponent,
    HomeComponent,
    GoogleTranslateComponent,
    PercentageMaskDirective,
    OfferInvestmentInfoComponent,
    LoadingDialogComponent,
    WalletTxHistoryComponent,
    WalletTxHistoryItemComponent,
    AdminIssuerComponent,
    AddButtonComponent,
    AdminIssuerAssetItemComponent,
    AdminIssuerEditComponent,
    AdminAssetDetailComponent,
    AdminCampaignItemComponent,
    AdminAssetEditComponent,
    AdminAssetNewComponent,
    FormYesNoButtonsComponent,
    AdminAssetCampaignNewComponent,
    DateMaskDirective,
    BigNumberInputDirective,
    AdminCampaignEditComponent,
    AdminCampaignAddTokensComponent,
    AdminCampaignDetailComponent,
    AdminIssuerNewComponent,
    AdminIssuerEditCampaignVisibilityComponent,
    AdminIssuerEditCampaignVisibilityCardComponent,
    LoadingDialogApprovalComponent,
    LoadingDialogTransactionComponent,
    LoadingOverlayComponent,
    DepositDialogComponent,
    AuthMagicOauthComponent,
    TransferComponent,
    SwapComponent,
    PayoutsComponent,
    SnapshotsComponent,
    SnapshotComponent,
    SnapshotNewComponent,
    PayoutComponent,
    PayoutNewComponent,
    ClaimsComponent,
    WrongNetworkComponent,
    RequestSendNewComponent,
    RequestSendActionComponent,
    RequestSendShowComponent,
    RequestBalanceActionComponent,
    RequestWalletActionComponent,
    DashboardHolderComponent,
    ContractsTableHolderComponent,
    ThirdPartyIntegrationsOverviewComponent,
    ContractsComponent,
    AddressBookComponent,
    AirdropComponent,
    PaymentsComponent,
    RequestSendListComponent,
    InfoSnippetComponent,
    AuthorizationsComponent,
    AuthorizationNewComponent,
    ContractDeployExecEnvComponent,
    DeployFromManifestComponent,
    InteractWithContractsComponent,
    SmartInputComponent,
    ContractSmartInputComponent,
    AddressSmartInputComponent,
    DateTimeSmartInputComponent,
    DurationSmartInputComponent,
    ArraySmartInputComponent,
    FunctionCallExecEnvComponent,
    WorkflowsComponent,
    ContractFunctionInteractionItemComponent,
    WorkflowActionItemComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    ReactiveFormsModule,
    AkitaNgRouterStoreModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    A11yModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    AppQuillModule,
  ],
  providers: [
    PreferenceService,
    {
      provide: APP_INITIALIZER,
      useFactory: (pref: PreferenceService) => () =>
        combineLatest([pref.initSigner(), pref.checkFixedConfig()]),
      multi: true,
      deps: [PreferenceService],
    },
    {
      provide: NG_ENTITY_SERVICE_CONFIG,
      useValue: { baseUrl: 'https://jsonplaceholder.typicode.com' },
    },
    CurrencyPipe,
    IssuerPathPipe,
    ToUrlIPFSPipe,
    TruncatePipe,
    UnescapePipe,
    PercentPipe,
    FormatUnitPipe,
    DatePipe,
    DecimalPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(router: Router, viewportScroller: ViewportScroller) {
    // Workaround for issue with scroll restoration
    // https://github.com/angular/angular/issues/24547#issuecomment-503076245
    router.events
      .pipe(
        filter((e: any): e is Scroll => e instanceof Scroll),
        delay(200)
      )
      .subscribe((e) => {
        if (e.position) {
          // backward navigation
          viewportScroller.scrollToPosition(e.position)
        } else if (e.anchor) {
          // anchor navigation
          viewportScroller.scrollToAnchor(e.anchor)
        } else {
          // forward navigation
          viewportScroller.scrollToPosition([0, 0])
        }
      })
  }
}
