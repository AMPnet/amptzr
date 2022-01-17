import {ChangeDetectionStrategy, Component} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {concatMap, defer, of} from 'rxjs'
import {MagicSubsignerService} from '../../shared/services/subsigners/magic-subsigner.service'
import {RouterService} from '../../shared/services/router.service'
import {filter, switchMap} from 'rxjs/operators'
import {SignerService} from '../../shared/services/signer.service'
import {getWindow} from '../../shared/utils/browser'

@Component({
  selector: 'app-auth-magic-oauth',
  templateUrl: './auth-magic-oauth.component.html',
  styleUrls: ['./auth-magic-oauth.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthMagicOauthComponent {
  handleCallback1$ = defer(() => of(this.route.snapshot.queryParams)).pipe(
    filter(params => !params.redirectBack),
    concatMap(() => {
      const url = new URL(getWindow().location.href)
      const callbackUrl = localStorage.getItem('callbackUrl')
      localStorage.removeItem('callbackUrl')
      const redirectBack = localStorage.getItem('redirectBack')
      localStorage.removeItem('redirectBack')
      url.searchParams.set('redirectBack', redirectBack || '')

      return this.router.router.navigateByUrl(`${callbackUrl}${url.search}`)
    }),
  )

  handleCallback2$ = defer(() => of(this.route.snapshot.queryParams)).pipe(
    filter(params => !!params.redirectBack),
    switchMap(() => this.magicSubsignerService.registerMagic),
    switchMap(() => this.magicSubsignerService.subprovider!.oauth.getRedirectResult()),
    switchMap(res => this.signerService.login(this.magicSubsignerService, {
      idToken: res.magic.idToken,
      force: true,
    })),
    concatMap(() => this.router.router.navigateByUrl(this.route.snapshot.queryParams.redirectBack)),
  )

  constructor(private route: ActivatedRoute,
              private router: RouterService,
              private signerService: SignerService,
              private magicSubsignerService: MagicSubsignerService) {
  }
}
