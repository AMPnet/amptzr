import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
} from '@angular/core'
import { filter, first, switchMap, tap } from 'rxjs/operators'
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker'
import { concat, defer, from, interval } from 'rxjs'
import { DialogService } from './shared/services/dialog.service'
import { Title } from '@angular/platform-browser'
import { IssuerService } from './shared/services/blockchain/issuer/issuer.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(
    public updates: SwUpdate,
    private appRef: ApplicationRef,
    private issuerService: IssuerService,
    private title: Title,
    private dialog: DialogService
  ) {}

  checkForUpdate$ = defer(() => {
    const appIsStable$ = this.appRef.isStable.pipe(
      first((isStable) => isStable)
    )
    const interval$ = interval(20 * 60 * 1000)
    return concat(appIsStable$, interval$)
  }).pipe(tap(() => this.updates.checkForUpdate()))

  appUpdate$ = this.updates.versionUpdates.pipe(
    filter(
      (event): event is VersionReadyEvent => event.type === 'VERSION_READY'
    ),
    switchMap(() =>
      this.dialog.info({
        title: 'New version available',
        message: 'The application must be reloaded.',
        cancelable: false,
      })
    ),
    switchMap(() => from(this.updates.activateUpdate())),
    tap(() => document.location.reload())
  )

  unrecoverable$ = this.updates.unrecoverable.pipe(
    tap((event) => console.error('unrecoverable', event.reason)),
    tap(() => document.location.reload())
  )

  issuerTitle$ = this.issuerService.issuerWithStatus$.pipe(
    filter((res) => !!res.value),
    tap((issuer) =>
      this.title.setTitle(`${issuer.value!.infoData.name} / Dev3`)
    )
  )
}
