import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdentityComponent {
  constructor() {
  }
}
