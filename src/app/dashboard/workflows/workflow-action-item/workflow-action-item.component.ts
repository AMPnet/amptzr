import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-workflow-action-item',
  templateUrl: './workflow-action-item.component.html',
  styleUrls: ['./workflow-action-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowActionItemComponent {

  showDetailsSub = new BehaviorSubject(false)
  showDetails$ = this.showDetailsSub.asObservable()

  @Input() isEmpty = false

  constructor() { }

  toggleDetails() {
    this.showDetailsSub.next(!this.showDetailsSub.getValue())
  }

  fillActionItem() {
    this.isEmpty = false
  }

}
