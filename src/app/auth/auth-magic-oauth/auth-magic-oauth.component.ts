import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MagicSubsignerService } from '../../shared/services/subsigners/magic-subsigner.service'
import { RouterService } from '../../shared/services/router.service'
import { SignerService } from '../../shared/services/signer.service'

import { Magic } from 'magic-sdk'
import { OAuthExtension } from '@magic-ext/oauth'
import { of, switchMap, tap } from 'rxjs'

@Component({
  selector: 'app-auth-magic-oauth',
  templateUrl: './auth-magic-oauth.component.html',
  styleUrls: ['./auth-magic-oauth.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthMagicOauthComponent implements OnInit {

  magic = new Magic(this.magicSubsignerService.DEFAULT_API_KEY, {
    extensions: [new OAuthExtension()]
  })

  constructor(
    private route: ActivatedRoute,
    private router: RouterService,
    private signer: SignerService,
    private magicSubsignerService: MagicSubsignerService
  ) {
    
  }

  ngOnInit(): void {
    this.getResult()
  }
  // this.magicSubsignerService.registerMagic.pipe(
  //   switchMap(() => this.magicSubsignerService.subprovider!.oauth.getRedirectResult()),
  //   switchMap(res => this.signer.login(this.magicSubsignerService, {
  //     idToken: res.magic.idToken,
  //     force: true,
  //   })),

  async getResult() {
    const result = await this.magic.oauth.getRedirectResult()
    this.magicSubsignerService.registerMagic.pipe(
      switchMap(() => this.signer.login(this.magicSubsignerService, {
        idToken: result.magic.idToken,
        force: true
      })),
      tap(() => { 
        alert("here")
      })
    )
  }

}
