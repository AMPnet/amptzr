import {ChangeDetectionStrategy, Component, Input} from '@angular/core'

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  @Input() type: 'inline-xs' | 'inline-base' = 'inline-base'

  constructor() {
  }
}
