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
import {WalletStatusComponent} from './shared/components/wallet-status/wallet-status.component'
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
import {InvestPreviewComponent} from './invest-preview/invest-preview.component'
import {IdentityComponent} from './identity/identity.component'
import {OffersCardLargeComponent} from './offers/offers-card-large/offers-card-large.component'
import {CurrencyPipe} from '@angular/common'
import {CurrencyDefaultPipe} from './shared/pipes/currency-default.pipe'
import {AuthComponent} from './auth/auth.component'
import {HttpClientModule} from '@angular/common/http'
import {VeriffComponent} from './identity/veriff/veriff.component'

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    OffersComponent,
    PortfolioComponent,
    WalletComponent,
    WalletStatusComponent,
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
    InvestPreviewComponent,
    IdentityComponent,
    OffersCardLargeComponent,
    CurrencyDefaultPipe,
    VeriffComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AkitaNgRouterStoreModule,
    BrowserAnimationsModule,
    MatDialogModule,
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
  ],
  bootstrap: [AppComponent],
})

export class AppModule {
}
