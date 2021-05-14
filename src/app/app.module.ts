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
import {WalletComponent} from './shared/components/wallet/wallet.component';
import {WalletConnectComponent} from './shared/components/wallet/wallet-connect/wallet-connect.component';
import {MatDialogModule} from '@angular/material/dialog';
import {PortfolioComponent} from './portfolio/portfolio.component';
import {SignerService} from './shared/services/signers/signer.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    OffersComponent,
    WalletComponent,
    WalletConnectComponent,
    PortfolioComponent
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
    SignerService,
    {
      provide: APP_INITIALIZER,
      useFactory: (web3: SignerService) =>
        () => web3.initSigner().toPromise(),
      multi: true,
      deps: [SignerService]
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
