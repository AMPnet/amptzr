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
import {IssuerGuard} from './shared/guards/issuer.guard'
import {environment} from '../environments/environment'
import {NetworkGuard} from './shared/guards/network.guard'
import {HomeComponent} from './home/home.component'
import {AdminGuard} from './shared/guards/admin.guard'
import {AdminIssuerEditComponent} from './admin/admin-issuer-edit/admin-issuer-edit.component'
import {AdminAssetDetailComponent} from './admin/admin-asset-detail/admin-asset-detail.component'
import {AdminAssetEditComponent} from './admin/admin-asset-edit/admin-asset-edit.component'
import {AdminIssuerComponent} from './admin/admin-issuer/admin-issuer.component'
import {AdminAssetNewComponent} from './admin/admin-asset-new/admin-asset-new.component'
import {AdminAssetCampaignNewComponent} from './admin/admin-asset-campaign-new/admin-asset-campaign-new.component'
import {AdminCampaignEditComponent} from './admin/admin-campaign-edit/admin-campaign-edit.component'
import {AdminCampaignDetailComponent} from './admin/admin-campaign-detail/admin-campaign-detail.component'
import {AdminCampaignAddTokensComponent} from './admin/admin-campaign-add-tokens/admin-campaign-add-tokens.component'
import {AdminIssuerNewComponent} from './admin/admin-issuer-new/admin-issuer-new.component'

const appRoutes: Routes = [
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
      {
        path: 'admin', canActivate: [AuthGuard, AdminGuard], children: [
          {path: '', pathMatch: 'full', redirectTo: 'issuer'},
          {path: 'issuer', component: AdminIssuerComponent},
          {path: 'issuer/edit', component: AdminIssuerEditComponent},
          {path: 'assets/new', component: AdminAssetNewComponent},
          {path: 'assets/:id', component: AdminAssetDetailComponent},
          {path: 'assets/:id/edit', component: AdminAssetEditComponent},
          {path: 'assets/:id/campaigns/new', component: AdminAssetCampaignNewComponent},
          {path: 'campaigns/:campaignId', component: AdminCampaignDetailComponent},
          {path: 'campaigns/:campaignId/edit', component: AdminCampaignEditComponent},
          {path: 'campaigns/:campaignId/add-tokens', component: AdminCampaignAddTokensComponent},
        ],
      },
      {path: 'dev_playground', component: DevPlaygroundComponent},
    ],
  },
  {path: '**', redirectTo: '/offers'},
]

const issuerRoutes: Routes = [{
  path: !environment.fixed.issuer ? ':issuer' : '',
  canActivate: [IssuerGuard], children: appRoutes,
}]

const networkRoutes: Routes = [{
  path: !environment.fixed.chainID ? ':chainID' : '',
  canActivate: [NetworkGuard], children: [
    {path: 'admin/issuers/new', component: AdminIssuerNewComponent},
    ...issuerRoutes,
  ],
}]

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: !environment.fixed.issuer ? '/home' : '/offers'},
  {path: 'home', component: HomeComponent},
  {
    path: '', children: networkRoutes,
  },
  {path: '**', redirectTo: '/home'},
]

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    //enableTracing: this, // enable for testing purposes
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
