import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { switchMap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { RequestBalanceService } from 'src/app/request-balance/request-balance.service'
import { SendRequestStatus } from 'src/app/request-send/request-send.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'

@Component({
  selector: 'app-authorizations',
  templateUrl: './authorizations.component.html',
  styleUrls: ['./authorizations.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationsComponent implements OnInit {

  constructor(private requestBalanceService: RequestBalanceService,
    private preferenceQuery: PreferenceQuery,
    private projectService: ProjectService) { }

  activeTab = Tab.Manage
  tabType = Tab

  authRequestStatusType = SendRequestStatus
  
  authRequests$ = this.projectService.getProjectIdByChainAndAddress().pipe(
    switchMap(result => this.requestBalanceService.getRequestsForProject(result.id))
  )

  ngOnInit(): void {
    this.authRequests$.subscribe(res => {
      console.log("AUTH REQUESTS: " + res)
    })
  }

  changeTab(tab: Tab) {
    this.activeTab = tab
  }
}

enum Tab {
  Manage, 
  New
}