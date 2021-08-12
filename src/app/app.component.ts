import {ChangeDetectionStrategy, Component} from '@angular/core'
import {filter, switchMap, tap} from 'rxjs/operators'
import {SwUpdate} from '@angular/service-worker'
import {from} from 'rxjs'
import {DialogService} from './shared/services/dialog.service'
import {IssuerService} from './shared/services/blockchain/issuer.service'
import {Title} from '@angular/platform-browser'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private updates: SwUpdate,
              private issuerService: IssuerService,
              private title: Title,
              private dialog: DialogService) {
  }

  appUpdate$ = this.updates.available.pipe(
    switchMap(() => this.dialog.info('New version available. The app will be reloaded.', false)),
    switchMap(() => from(this.updates.activateUpdate())),
    tap(() => document.location.reload()),
  )

  issuerTitle$ = this.issuerService.issuerWithStatus$.pipe(
    filter(res => !!res.value),
    tap(issuer => this.title.setTitle(issuer.value!.name)),
  )
}
