import {ChangeDetectionStrategy, Component, ElementRef, Input, Renderer2} from '@angular/core'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {MetamaskSubsignerService} from '../../services/subsigners/metamask-subsigner.service'
import {SignerService} from '../../services/signer.service'
import {map, tap} from 'rxjs/operators'
import {combineLatest, Observable} from 'rxjs'
import {SessionQuery} from '../../../session/state/session.query'
import {AuthProvider} from '../../../preference/state/preference.store'

@Component({
  selector: 'app-add-to-metamask',
  templateUrl: './add-to-metamask.component.html',
  styleUrls: ['./add-to-metamask.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToMetamaskComponent {
  @Input() value = ''

  isAvailable$: Observable<boolean> = combineLatest([
    this.signer.injectedWeb3$,
    this.preferenceQuery.authProvider$,
  ]).pipe(
    map(([ethereum, authProvider]) =>
      !!ethereum.isMetaMask && authProvider === AuthProvider.METAMASK,
    ),
    tap(isAvailable => {
      isAvailable ?
        this.renderer.removeStyle(this.elementRef.nativeElement, 'display') :
        this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none')
    }),
  )

  constructor(
    private preferenceQuery: PreferenceQuery,
    private sessionQuery: SessionQuery,
    private signer: SignerService,
    private metamaskSubsignerService: MetamaskSubsignerService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {
  }

  watchAsset(): Observable<unknown> {
    return this.metamaskSubsignerService.watchAsset(this.value)
  }
}
