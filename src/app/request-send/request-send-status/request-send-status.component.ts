import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-request-send-status',
  templateUrl: './request-send-status.component.html',
  styleUrls: ['./request-send-status.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestSendStatusComponent {
  constructor() {
  }
}
