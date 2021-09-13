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
import {CampaignNewComponent} from './campaigns/campaign-new/campaign-new.component'
import {CampaignDetailComponent} from './campaigns/campaign-detail/campaign-detail.component'
import {CampaignEditComponent} from './campaigns/campaign-edit/campaign-edit.component'
import {CampaignAddTokensComponent} from './campaigns/campaign-add-tokens/campaign-add-tokens.component'
import {IssuerGuard} from './shared/guards/issuer.guard'
import {IssuerEditAdvancedComponent} from './issuers/issuer-edit-advanced/issuer-edit-advanced.component'
import {environment} from '../environments/environment'
import {NetworkGuard} from './shared/guards/network.guard'
import {AppComponent} from './app.component'
import {HomeComponent} from './home/home.component'
import {FtAssetDetailComponent} from './assets/ft-assets/ft-asset-detail/ft-asset-detail.component'
import {FtAssetEditComponent} from './assets/ft-assets/ft-asset-edit/ft-asset-edit.component'
import {AssetDetailComponent} from './assets/assets/asset-detail/asset-detail.component'
import {AssetEditComponent} from './assets/assets/asset-edit/asset-edit.component'
import {AssetNewComponent} from './assets/assets/asset-new/asset-new.component'
import {FtAssetNewComponent} from './assets/ft-assets/ft-asset-new/ft-asset-new.component'
import {AdminGuard} from './shared/guards/admin.guard'
import {AdminIssuerEditComponent} from './admin/admin-issuer-edit/admin-issuer-edit.component'
import {AdminAssetDetailComponent} from './admin/admin-asset-detail/admin-asset-detail.component'
import {AdminFtAssetDetailComponent} from './admin/admin-ft-asset-detail/admin-ft-asset-detail.component'
import {AdminAssetEditComponent} from './admin/admin-asset-edit/admin-asset-edit.component'
import {AdminFtAssetEditComponent} from './admin/admin-ft-asset-edit/admin-ft-asset-edit.component'
import {AdminIssuerComponent} from './admin/admin-issuer/admin-issuer.component'
import {AdminAssetNewComponent} from './admin/admin-asset-new/admin-asset-new.component'
import {AdminFtAssetNewComponent} from './admin/admin-ft-asset-new/admin-ft-asset-new.component'

const appRoutes: Routes = [
  {
    path: '', children: [
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
          {path: 'ft_assets/new', component: AdminFtAssetNewComponent},
          {path: 'ft_assets/:id', component: AdminFtAssetDetailComponent},
          {path: 'ft_assets/:id/edit', component: AdminFtAssetEditComponent},
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
  canActivate: [NetworkGuard], children: issuerRoutes,
}]

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: !environment.fixed.issuer ? '/home' : '/offers'},
  {path: 'home', component: HomeComponent},
  {path: 'issuers', component: IssuerListComponent},
  {path: 'issuers/new', component: IssuerNewComponent},
  {path: 'issuers/:id', component: IssuerDetailComponent},
  {path: 'issuers/:id/edit', component: IssuerEditComponent},
  {path: 'issuers/:id/edit/advanced', component: IssuerEditAdvancedComponent},
  {path: 'issuers/:id/assets/new', component: AssetNewComponent},
  {path: 'issuers/:id/ft_assets/new', component: FtAssetNewComponent},
  {path: 'assets/:id', component: AssetDetailComponent},
  {path: 'assets/:id/edit', component: AssetEditComponent},
  {path: 'assets/:id/campaigns/new', component: CampaignNewComponent},
  {path: 'ft_assets/:id', component: FtAssetDetailComponent},
  {path: 'ft_assets/:id/edit', component: FtAssetEditComponent},
  {path: 'ft_assets/:id/campaigns/new', component: CampaignNewComponent},
  {path: 'campaigns/:id', component: CampaignDetailComponent},
  {path: 'campaigns/:id/edit', component: CampaignEditComponent},
  {path: 'campaigns/:id/add-tokens', component: CampaignAddTokensComponent},
  {
    path: '', component: AppLayoutComponent, children: networkRoutes,
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
