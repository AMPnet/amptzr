import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowsComponent {

  workFlowItemDisplayedSub = new BehaviorSubject(false)
  workflowItemDisplayed$ = this.workFlowItemDisplayedSub.asObservable()

  constructor() { }

  toggleItem() {
    this.workFlowItemDisplayedSub.next(!this.workFlowItemDisplayedSub.value)
  }

}
