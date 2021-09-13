import {ApplicationRef, ChangeDetectionStrategy, Component} from '@angular/core'
import {filter, first, switchMap, tap} from 'rxjs/operators'
import {SwUpdate} from '@angular/service-worker'
import {concat, defer, from, interval} from 'rxjs'
import {IssuerService} from './shared/services/blockchain/issuer.service'
import {DialogService} from './shared/services/dialog.service'
import {Title} from '@angular/platform-browser'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private updates: SwUpdate,
              private appRef: ApplicationRef,
              private issuerService: IssuerService,
              private title: Title,
              private dialog: DialogService) {
    console.log('isenabled', updates.isEnabled)
    updates.available.subscribe(() => console.log('available'))
    updates.activated.subscribe(() => console.log('activated'))
  }

  checkForUpdate$ = defer(() => {
    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable))
    const interval$ = interval(15 * 1000)
    return concat(appIsStable$, interval$)
  }).pipe(
    tap(() => console.log('check for update')),
    tap(() => this.updates.checkForUpdate()),
  )

  appUpdate$ = this.updates.available.pipe(
    tap(() => console.log('update available')),
    switchMap(() => this.dialog.info('New version available. The app will be reloaded.', false)),
    switchMap(() => from(this.updates.activateUpdate())),
    tap(() => document.location.reload()),
  )

  unrecoverable$ = this.updates.unrecoverable.pipe(
    tap(event => console.log('unrecoverable', event.reason)),
    tap(() => document.location.reload()),
  )

  issuerTitle$ = this.issuerService.issuerWithStatus$.pipe(
    filter(res => !!res.value),
    tap(issuer => this.title.setTitle(issuer.value!.name)),
  )
}
