import {ChangeDetectionStrategy, Component} from '@angular/core'
import {CrispService} from '../shared/services/crisp.service'

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {
  constructor(public crispService: CrispService) {
  }
}
