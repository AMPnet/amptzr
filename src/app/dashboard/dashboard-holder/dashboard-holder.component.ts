import { Component, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { BackendHttpClient } from 'src/app/shared/services/backend/backend-http-client.service'
import { JwtTokenService } from 'src/app/shared/services/backend/jwt-token.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import {
  IssuerService,
  IssuerWithInfo,
} from 'src/app/shared/services/blockchain/issuer/issuer.service'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { RouterService } from 'src/app/shared/services/router.service'
import { TailwindService } from 'src/app/shared/services/tailwind.service'
import { withStatus } from 'src/app/shared/utils/observables'

@Component({
  selector: 'app-dashboard-holder',
  templateUrl: './dashboard-holder.component.html',
  styleUrls: ['./dashboard-holder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHolderComponent {
  navbarSelectedIndex = 0
  issuer$ = this.issuerService.issuer$
  network$ = this.preferenceQuery.network$
  isBackendAuthorized$ = this.preferenceQuery.isBackendAuthorized$
  
  screenSize$ = this.tailwindService.screenResize$

  refreshAPIKeySub = new BehaviorSubject<void>(undefined)

  apiKey$ = this.refreshAPIKeySub.asObservable().pipe(
    switchMap(() => this.isBackendAuthorized$),
    switchMap((isAuthorized) =>
      isAuthorized ? this.fetchApiKey() : of(undefined)
    )
  )

  constructor(
    private router: RouterService,
    private issuerService: IssuerService,
    private projectService: ProjectService,
    private dialogService: DialogService,
    private http: BackendHttpClient,
    private preferenceQuery: PreferenceQuery,
    private tailwindService: TailwindService
  ) {
    this.screenSize$.subscribe((x) => console.log(x))
  }

  sidebarItemClicked(index: number) {
    this.navbarSelectedIndex = index
    this.changeRoute()
  }

  authorize() {
    return this.http.ensureAuth
  }

  createApiKey() {
    return this.projectService.getProjectIdByChainAndAddress().pipe(
      switchMap((project) => this.projectService.createApiKey(project.id)),
      switchMap(() =>
        this.dialogService.info({
          title: 'Success',
          message: `Your API Key wass successfully created.`,
          cancelable: false,
        })
      ),
      tap(() => this.refreshAPIKeySub.next())
    )
  }

  fetchApiKey() {
    return this.projectService.fetchApiKey()
  }

  changeRoute() {
    if (this.navbarSelectedIndex === 3) {
    }
  }

  editIssuer() {
    this.router.navigate([`/admin/issuer/edit`])
  }

  backToIssuer() {
    this.router.router.navigate([`/`])
  }
}
