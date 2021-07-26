import {NgModule} from '@angular/core'
import {RouterModule, Routes} from '@angular/router'
import {OffersComponent} from './offers/offers.component'
import {PortfolioComponent} from './portfolio/portfolio.component'
import {WalletComponent} from './wallet/wallet.component'
import {DevPlaygroundComponent} from './shared/components/dev-playground/dev-playground.component'
import {AppLayoutComponent} from './app-layout/app-layout.component'
import {AuthComponent} from './auth/auth.component'
import {OfferComponent} from './offer/offer.component'
import {InvestComponent} from './invest/invest.component'
import {InvestPreviewComponent} from './invest-preview/invest-preview.component'
import {IdentityComponent} from './identity/identity.component'
import {DepositComponent} from './deposit/deposit.component'
import {NoAuthGuard} from './shared/guards/no-auth.guard'
import {AuthGuard} from './shared/guards/auth.guard'

const routes: Routes = [
  {
    path: '', component: AppLayoutComponent, children: [
      {path: '', pathMatch: 'full', redirectTo: 'offers'},
      {path: 'offers', component: OffersComponent},
      {path: 'offers/:id', component: OfferComponent},
      {
        path: '', canActivate: [AuthGuard], children: [
          {path: 'wallet', component: WalletComponent, canActivate: [AuthGuard]},
          {path: 'deposit', component: DepositComponent},
          {path: 'offers/:id/invest', component: InvestComponent},
          {path: 'invest/preview', component: InvestPreviewComponent},
          {path: 'portfolio', component: PortfolioComponent},
          {path: 'identity', component: IdentityComponent},
        ],
      },
      {path: 'dev_playground', component: DevPlaygroundComponent},
    ],
  },
  {path: 'auth', component: AuthComponent, canActivate: [NoAuthGuard]},
  {path: 'dev_playground', component: DevPlaygroundComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
