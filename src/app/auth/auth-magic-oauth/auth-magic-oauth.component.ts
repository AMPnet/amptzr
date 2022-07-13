import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { concatMap, defer, Observable, of } from 'rxjs'
import { MagicSubsignerService } from '../../shared/services/subsigners/magic-subsigner.service'
import { RouterService } from '../../shared/services/router.service'
import { catchError, filter, switchMap, timeout } from 'rxjs/operators'
import { SignerService } from '../../shared/services/signer.service'
import { getWindow } from '../../shared/utils/browser'
import { WithStatus, withStatus } from '../../shared/utils/observables'

@Component({
  selector: 'app-auth-magic-oauth',
  templateUrl: './auth-magic-oauth.component.html',
  styleUrls: ['./auth-magic-oauth.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthMagicOauthComponent {
  handleCallback1$: Observable<unknown>
  handleCallback2$: Observable<WithStatus<unknown>>

  constructor(
    private route: ActivatedRoute,
    private router: RouterService,
    private signer: SignerService,
    private magicSubsignerService: MagicSubsignerService
  ) {
    this.handleCallback1$ = defer(() =>
      of(this.route.snapshot.queryParams)
    ).pipe(
      filter((params) => !params.redirectBack),
      concatMap(() => {
        const url = new URL(getWindow().location.href)
        const callbackUrl = localStorage.getItem('callbackUrl')
        localStorage.removeItem('callbackUrl')
        const redirectBack = localStorage.getItem('redirectBack')
        localStorage.removeItem('redirectBack')
        url.searchParams.set('redirectBack', redirectBack || '')

        return this.router.router.navigateByUrl(`${callbackUrl}${url.search}`)
      })
    )

    this.handleCallback2$ = defer(() =>
      of(this.route.snapshot.queryParams)
    ).pipe(
      filter((params) => !!params.redirectBack),
      switchMap((params) =>
        withStatus(
          this.magicSubsignerService.registerMagic.pipe(
            switchMap(() =>
              this.magicSubsignerService.subprovider!.oauth.getRedirectResult()
            ),
            switchMap((res) =>
              this.signer.login(this.magicSubsignerService, {
                idToken: res.magic.idToken,
                force: true,
              })
            ),
            timeout(60_000),
            catchError(() => of(undefined)),
            concatMap(() =>
              this.router.router.navigateByUrl(params.redirectBack)
            )
          )
        )
      )
    )
  }
}
