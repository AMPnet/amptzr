import {ChangeDetectionStrategy, Component} from '@angular/core'
import {AppLayoutQuery} from './state/app-layout.query'
import {AppLayoutStore} from './state/app-layout.store'
import {shareReplay} from 'rxjs/operators'

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {

  constructor() { }

}
