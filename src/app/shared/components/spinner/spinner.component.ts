import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {of} from "rxjs"
import {delay} from "rxjs/operators"

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  @Input() type: 'inline-xs' | 'inline-base' | 'overlay' = 'inline-base'
  delayedDisplay$ = of(true).pipe(
    delay(300)
  )

  constructor() {
  }
}
