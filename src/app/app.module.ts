import {BrowserModule} from '@angular/platform-browser'
import {APP_INITIALIZER, NgModule} from '@angular/core'

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
import {CurrencyPipe} from '@angular/common'
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
import {AssetNewComponent} from './assets/asset-new/asset-new.component'
import {AssetEditComponent} from './assets/asset-edit/asset-edit.component'
import {AssetDetailComponent} from './assets/asset-detail/asset-detail.component'
import {AssetCampaignNewComponent} from './assets/asset-campaign-new/asset-campaign-new.component'
import {FormatUnitPipe} from './shared/pipes/format-unit.pipe'
import {ToTextIpfsPipe} from './shared/pipes/to-text-ipfs.pipe'
import {ToUrlIPFSPipe} from './shared/pipes/to-url-ipfs.pipe'
import {CampaignDetailComponent} from './campaigns/campaign-detail/campaign-detail.component'
import {CampaignEditComponent} from './campaigns/campaign-edit/campaign-edit.component'
import {CampaignNewComponent} from './campaigns/campaign-new/campaign-new.component'
import {CampaignAddTokensComponent} from './campaigns/campaign-add-tokens/campaign-add-tokens.component'
import {IssuerPathPipe} from './shared/pipes/issuer-path.pipe'
import {OffersCardLargeComponent} from './offers/offers-card-large/offers-card-large.component'
import {OffersCardSmallComponent} from './offers/offers-card-small/offers-card-small.component'
import {WalletButtonComponent} from './app-layout/navbar/wallet-button/wallet-button.component'
import {FaqQuestionComponent} from './faq/faq-question/faq-question.component'
import {MatTooltipModule} from '@angular/material/tooltip'
import {IssuerEditAdvancedComponent} from './issuers/issuer-edit-advanced/issuer-edit-advanced.component'
import {DepositFlowComponent} from './deposit/deposit-flow/deposit-flow.component'
import {TruncatePipe} from './shared/pipes/truncate.pipe'
import {UnescapePipe} from './shared/pipes/unescape.pipe'

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
    OffersCardLargeComponent,
    OffersCardSmallComponent,
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
    AssetCampaignNewComponent,
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
    A11yModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    PreferenceService,
    {
      provide: APP_INITIALIZER,
      useFactory: (pref: PreferenceService) =>
        () => pref.initSigner().toPromise(),
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
    UnescapePipe
  ],
  bootstrap: [AppComponent],
})

export class AppModule {
}
