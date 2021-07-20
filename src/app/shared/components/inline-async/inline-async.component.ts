import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {Observable} from 'rxjs'
import {WithStatus} from '../../utils/observables'

@Component({
  selector: 'app-inline-async',
  templateUrl: './inline-async.component.html',
  styleUrls: ['./inline-async.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineAsyncComponent {
  @Input() observable$!: Observable<WithStatus<any>>
}
