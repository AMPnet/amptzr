import {NgModule} from '@angular/core'
import {RouterModule, Routes} from '@angular/router'
import {OffersComponent} from './offers/offers.component'
import {PortfolioComponent} from './portfolio/portfolio.component'
import {WalletComponent} from './wallet/wallet.component'
import {DevPlaygroundComponent} from './shared/components/dev-playground/dev-playground.component'
import {AppLayoutComponent} from './app-layout/app-layout.component'
import {OfferComponent} from './offer/offer.component'
import {InvestComponent} from './invest/invest.component'
import {DepositComponent} from './deposit/deposit.component'
import {AuthGuard} from './shared/guards/auth.guard'
import {FaqComponent} from './faq/faq.component'
import {IssuersComponent} from './issuers/issuers.component'

const routes: Routes = [
  {
    path: '', component: AppLayoutComponent, children: [
      {path: '', pathMatch: 'full', redirectTo: 'offers'},
      {path: 'offers', component: OffersComponent},
      {path: 'offers/:id', component: OfferComponent},
      {
        path: '', canActivate: [AuthGuard], children: [
          {path: 'offers/:id/invest', component: InvestComponent},
          {path: 'wallet', component: WalletComponent},
          {path: 'deposit', component: DepositComponent},
          {path: 'portfolio', component: PortfolioComponent},
        ],
      },
      {path: 'faq', component: FaqComponent},
      {path: 'issuers', component: IssuersComponent},
      {path: 'dev_playground', component: DevPlaygroundComponent},
    ],
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
