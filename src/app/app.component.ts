import {ChangeDetectionStrategy, Component} from '@angular/core'
import {switchMap, tap} from 'rxjs/operators'
import {SwUpdate} from '@angular/service-worker'
import {from} from 'rxjs'
import {DialogService} from './shared/services/dialog.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(private updates: SwUpdate,
              private dialog: DialogService) {
  }

  appUpdate$ = this.updates.available.pipe(
    switchMap(() => this.dialog.info('New version available. The app will be reloaded.', false)),
    switchMap(() => from(this.updates.activateUpdate())),
    tap(() => document.location.reload())
  );
}
