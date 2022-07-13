import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { forkJoin, from, map, mergeMap, Observable, of, switchMap } from 'rxjs'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { Erc20Service, ERC20TokenData } from 'src/app/shared/services/blockchain/erc20.service'
import { RequestSendService, SendRequests } from '../request-send.service'

@Component({
  selector: 'app-request-send-list',
  templateUrl: './request-send-list.component.html',
  styleUrls: ['./request-send-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestSendListComponent {

  sendRequests$: Observable<SendRequests> = this.projectService.getProjectIdByChainAndAddress().pipe(
    switchMap(project => this.requestSendService.getAllRequests(project.id))
  )

  assets$ = this.sendRequests$.pipe(
    map(requests => requests.requests.map(value => {
      return this.erc20Service.getData(value.token_address)
    }))
  )

  constructor(private requestSendService: RequestSendService, 
    private projectService: ProjectService, private erc20Service: Erc20Service) { }


}
