import {ChangeDetectionStrategy, Component} from '@angular/core'
import {environment} from '../../../environments/environment'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  appVersion = environment.appVersion
  commitHash = environment.commitHash

  constructor() {
  }
}
