import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-request-send-new',
  templateUrl: './request-send-new.component.html',
  styleUrls: ['./request-send-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestSendNewComponent {
  constructor() {
  }
}
