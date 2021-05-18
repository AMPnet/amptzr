import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NavbarComponent} from './shared/components/navbar/navbar.component';
import {SidebarComponent} from './shared/components/sidebar/sidebar.component';
import {NG_ENTITY_SERVICE_CONFIG} from '@datorama/akita-ng-entity-service';
import {AkitaNgDevtools} from '@datorama/akita-ngdevtools';
import {AkitaNgRouterStoreModule} from '@datorama/akita-ng-router-store';
import {environment} from '../environments/environment';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {OffersComponent} from './offers/offers.component';
import {MatDialogModule} from '@angular/material/dialog';
import {PortfolioComponent} from './portfolio/portfolio.component';
import {WalletStatusComponent} from './shared/components/wallet-status/wallet-status.component';
import {WalletComponent} from './wallet/wallet.component';
import {WalletConnectComponent} from './wallet/wallet-connect/wallet-connect.component';
import {ActionButtonComponent} from './shared/components/action-button/action-button.component';
import {AddrShortPipe} from './shared/pipes/addr-short.pipe';
import {InfoDialogComponent} from './shared/components/info-dialog/info-dialog.component';
import {DevPlaygroundComponent} from './shared/components/dev-playground/dev-playground.component';
import {PreferenceService} from './preference/state/preference.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    OffersComponent,
    PortfolioComponent,
    WalletComponent,
    WalletStatusComponent,
    WalletConnectComponent,
    ActionButtonComponent,
    AddrShortPipe,
    InfoDialogComponent,
    DevPlaygroundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AkitaNgRouterStoreModule,
    BrowserAnimationsModule,
    MatDialogModule,
  ],
  providers: [
    PreferenceService,
    {
      provide: APP_INITIALIZER,
      useFactory: (pref: PreferenceService) =>
        () => pref.initSigner().toPromise(),
      multi: true,
      deps: [PreferenceService]
    },
    {
      provide: NG_ENTITY_SERVICE_CONFIG,
      useValue: {baseUrl: 'https://jsonplaceholder.typicode.com'}
    },
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
