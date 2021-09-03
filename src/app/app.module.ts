import {BrowserModule} from '@angular/platform-browser'
import {APP_INITIALIZER, NgModule} from '@angular/core'
import {combineLatest} from 'rxjs'

import {AppRoutingModule} from './app-routing.module'
import {AppComponent} from './app.component'
import {NG_ENTITY_SERVICE_CONFIG} from '@datorama/akita-ng-entity-service'
import {AkitaNgDevtools} from '@datorama/akita-ngdevtools'
import {AkitaNgRouterStoreModule} from '@datorama/akita-ng-router-store'
import {environment} from '../environments/environment'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {OffersComponent} from './offers/offers.component'
import {MatDialogModule} from '@angular/material/dialog'
import {PortfolioComponent} from './portfolio/portfolio.component'
import {WalletComponent} from './wallet/wallet.component'
import {ActionButtonComponent} from './shared/components/action-button/action-button.component'
import {AddrShortPipe} from './shared/pipes/addr-short.pipe'
import {InfoDialogComponent} from './shared/components/info-dialog/info-dialog.component'
import {DevPlaygroundComponent} from './shared/components/dev-playground/dev-playground.component'
import {PreferenceService} from './preference/state/preference.service'
import {AppLayoutComponent} from './app-layout/app-layout.component'
import {NavbarComponent} from './app-layout/navbar/navbar.component'
import {FooterComponent} from './app-layout/footer/footer.component'
import {A11yModule} from '@angular/cdk/a11y'
import {SpinnerComponent} from './shared/components/spinner/spinner.component'
import {ServiceWorkerModule} from '@angular/service-worker'
import {InlineAsyncComponent} from './shared/components/inline-async/inline-async.component'
import {UnwrapStatusPipe} from './shared/pipes/unwrap-status.pipe'
import {OfferComponent} from './offer/offer.component'
import {DepositComponent} from './deposit/deposit.component'
import {InvestComponent} from './invest/invest.component'
import {CurrencyPipe, DatePipe, PercentPipe, ViewportScroller} from '@angular/common'
import {CurrencyDefaultPipe} from './shared/pipes/currency-default.pipe'
import {AuthComponent} from './auth/auth.component'
import {HttpClientModule} from '@angular/common/http'
import {VeriffComponent} from './identity/veriff/veriff.component'
import {FaqComponent} from './faq/faq.component'
import {FundingProgressComponent} from "./shared/components/funding-progress/funding-progress.component"
import {AuthProviderNamePipe} from "./shared/pipes/auth-provider-name.pipe"
import {ProfileAddMandatoryComponent} from './profile/profile-add-mandatory/profile-add-mandatory.component'
import {ReactiveFormsModule} from '@angular/forms'
import {CurrencyMaskDirective} from './shared/directives/currency-mask.directive'
import {ValueCopyComponent} from './shared/components/value-copy/value-copy.component'
import {FileInputAccessorDirective} from './shared/directives/file-input-accessor.directive'
import {IssuerEditComponent} from './issuers/issuer-edit/issuer-edit.component'
import {SafePipe} from './shared/pipes/safe.pipe'
import {IssuerNewComponent} from './issuers/issuer-new/issuer-new.component'
import {IssuerListComponent} from './issuers/issuer-list/issuer-list.component'
import {IssuerDetailComponent} from './issuers/issuer-detail/issuer-detail.component'
import {FormatUnitPipe} from './shared/pipes/format-unit.pipe'
import {ToTextIpfsPipe} from './shared/pipes/to-text-ipfs.pipe'
import {ToUrlIPFSPipe} from './shared/pipes/to-url-ipfs.pipe'
import {CampaignDetailComponent} from './campaigns/campaign-detail/campaign-detail.component'
import {CampaignEditComponent} from './campaigns/campaign-edit/campaign-edit.component'
import {CampaignNewComponent} from './campaigns/campaign-new/campaign-new.component'
import {CampaignAddTokensComponent} from './campaigns/campaign-add-tokens/campaign-add-tokens.component'
import {IssuerPathPipe} from './shared/pipes/issuer-path.pipe'
import {OffersCardComponent} from './offers/offers-card/offers-card.component'
import {WalletButtonComponent} from './app-layout/navbar/wallet-button/wallet-button.component'
import {FaqQuestionComponent} from './faq/faq-question/faq-question.component'
import {MatTooltipModule} from '@angular/material/tooltip'
import {IssuerEditAdvancedComponent} from './issuers/issuer-edit-advanced/issuer-edit-advanced.component'
import {DepositFlowComponent} from './deposit/deposit-flow/deposit-flow.component'
import {TruncatePipe} from './shared/pipes/truncate.pipe'
import {UnescapePipe} from './shared/pipes/unescape.pipe'
import {AppQuillModule} from './shared/modules/app-quill.module'
import {SelectNetworkComponent} from './shared/components/select-network/select-network.component'
import {HomeComponent} from './home/home.component'
import {GoogleTranslateComponent} from './shared/components/google-translate/google-translate.component'
import {PercentageMaskDirective} from './shared/directives/percentage-mask.directive'
import {OfferInvestmentInfoComponent} from './offer-investment-info/offer-investment-info.component'
import {Router, Scroll} from '@angular/router'
import {delay, filter} from 'rxjs/operators'
import {LoadingDialogComponent} from './shared/components/loading-dialog/loading-dialog.component'
import {WalletTxHistoryComponent} from './wallet/wallet-tx-history/wallet-tx-history.component'
import {WalletTxHistoryItemComponent} from './wallet/wallet-tx-history-item/wallet-tx-history-item.component'
import {FtAssetNewComponent} from './assets/ft-assets/ft-asset-new/ft-asset-new.component'
import {FtAssetEditComponent} from './assets/ft-assets/ft-asset-edit/ft-asset-edit.component'
import {FtAssetDetailComponent} from './assets/ft-assets/ft-asset-detail/ft-asset-detail.component'
import {AssetDetailComponent} from './assets/assets/asset-detail/asset-detail.component'
import {AssetEditComponent} from './assets/assets/asset-edit/asset-edit.component'
import {AssetNewComponent} from './assets/assets/asset-new/asset-new.component'
import {AssetPathSegmentPipe} from './shared/pipes/asset-path-segment.pipe'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {AdminComponent} from './admin/admin.component'
import {AddButtonComponent} from './shared/components/add-button/add-button.component'
import {AdminAssetListComponent} from './admin/admin-asset-list/admin-asset-list.component'
import {AdminAssetItemComponent} from './admin/admin-asset-item/admin-asset-item.component'
import {AdminIssuerEditComponent} from './admin/admin-issuer-edit/admin-issuer-edit.component'
import {AdminAssetDetailComponent} from './admin/admin-asset-detail/admin-asset-detail.component'
import {AdminCampaignListComponent} from './admin/admin-campaign-list/admin-campaign-list.component'
import {AdminFtAssetDetailComponent} from './admin/admin-ft-asset-detail/admin-ft-asset-detail.component'
import {AdminCampaignItemComponent} from './admin/admin-campaign-item/admin-campaign-item.component'
import {AdminAssetEditComponent} from './admin/admin-asset-edit/admin-asset-edit.component'
import {AdminFtAssetEditComponent} from './admin/admin-ft-asset-edit/admin-ft-asset-edit.component'

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    OffersComponent,
    PortfolioComponent,
    WalletComponent,
    ActionButtonComponent,
    AddrShortPipe,
    UnwrapStatusPipe,
    InfoDialogComponent,
    DevPlaygroundComponent,
    AppLayoutComponent,
    FooterComponent,
    SpinnerComponent,
    InlineAsyncComponent,
    AuthComponent,
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
    SafePipe,
    FormatUnitPipe,
    ToTextIpfsPipe,
    IssuerPathPipe,
    ProfileAddMandatoryComponent,
    CurrencyMaskDirective,
    ValueCopyComponent,
    FileInputAccessorDirective,
    IssuerEditComponent,
    IssuerDetailComponent,
    IssuerListComponent,
    IssuerNewComponent,
    IssuerListComponent,
    AssetNewComponent,
    AssetEditComponent,
    AssetDetailComponent,
    FtAssetNewComponent,
    FtAssetEditComponent,
    FtAssetDetailComponent,
    CampaignDetailComponent,
    CampaignEditComponent,
    CampaignNewComponent,
    CampaignAddTokensComponent,
    WalletButtonComponent,
    FaqQuestionComponent,
    IssuerEditAdvancedComponent,
    DepositFlowComponent,
    TruncatePipe,
    UnescapePipe,
    AssetPathSegmentPipe,
    SelectNetworkComponent,
    HomeComponent,
    GoogleTranslateComponent,
    PercentageMaskDirective,
    OfferInvestmentInfoComponent,
    LoadingDialogComponent,
    WalletTxHistoryComponent,
    WalletTxHistoryItemComponent,
    AdminComponent,
    AddButtonComponent,
    AdminAssetListComponent,
    AdminAssetItemComponent,
    AdminIssuerEditComponent,
    AdminAssetDetailComponent,
    AdminCampaignListComponent,
    AdminFtAssetDetailComponent,
    AdminCampaignItemComponent,
    AdminAssetEditComponent,
    AdminFtAssetEditComponent,
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
      useFactory: (pref: PreferenceService) =>
        () => combineLatest([pref.initSigner(), pref.checkFixedConfig()]),
      multi: true,
      deps: [PreferenceService],
    },
    {
      provide: NG_ENTITY_SERVICE_CONFIG,
      useValue: {baseUrl: 'https://jsonplaceholder.typicode.com'},
    },
    CurrencyPipe,
    IssuerPathPipe,
    ToUrlIPFSPipe,
    TruncatePipe,
    UnescapePipe,
    PercentPipe,
    DatePipe,
  ],
  bootstrap: [AppComponent],
})

export class AppModule {
  constructor(router: Router, viewportScroller: ViewportScroller) {
    // Workaround for issue with scroll restoration
    // https://github.com/angular/angular/issues/24547#issuecomment-503076245
    router.events.pipe(
      filter((e: any): e is Scroll => e instanceof Scroll),
      delay(200),
    ).subscribe(e => {
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
