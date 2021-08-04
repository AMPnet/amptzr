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
import {IssuerEditComponent} from './issuers/issuer-edit/issuer-edit.component'
import {IssuerNewComponent} from './issuers/issuer-new/issuer-new.component'
import {IssuerListComponent} from './issuers/issuer-list/issuer-list.component'
import {IssuerDetailComponent} from './issuers/issuer-detail/issuer-detail.component'
import {AssetNewComponent} from './assets/asset-new/asset-new.component'
import {AssetDetailComponent} from './assets/asset-detail/asset-detail.component'
import {AssetEditComponent} from './assets/asset-edit/asset-edit.component'
import {AssetCampaignNewComponent} from './assets/asset-campaign-new/asset-campaign-new.component'

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
      {path: 'issuers', component: IssuerListComponent},
      {path: 'issuers/new', component: IssuerNewComponent},
      {path: 'issuers/:id', component: IssuerDetailComponent},
      {path: 'issuers/:id/edit', component: IssuerEditComponent},
      {path: 'issuers/:id/assets/new', component: AssetNewComponent},
      {path: 'issuers/:id/assets/new-with-campaign', component: AssetCampaignNewComponent},
      {path: 'assets/:id', component: AssetDetailComponent},
      {path: 'assets/:id/edit', component: AssetEditComponent},
      {path: 'faq', component: FaqComponent},
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
