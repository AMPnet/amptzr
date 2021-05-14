import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OffersComponent} from './offers/offers.component';
import {PortfolioComponent} from './portfolio/portfolio.component';
import {WalletComponent} from './wallet/wallet.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'offers'},
  {path: 'offers', component: OffersComponent},
  {path: 'portfolio', component: PortfolioComponent},
  {path: 'wallet', component: WalletComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
