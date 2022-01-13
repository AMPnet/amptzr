import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {MetamaskSubsignerService} from '../../services/subsigners/metamask-subsigner.service'
import {SignerService} from '../../services/signer.service'
import {map} from 'rxjs/operators'
import {combineLatest, EMPTY, Observable} from 'rxjs'
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
  )

  constructor(
    private preferenceQuery: PreferenceQuery,
    private sessionQuery: SessionQuery,
    private signer: SignerService,
    private metamaskSubsignerService: MetamaskSubsignerService,
  ) {
  }

  watchAsset(): Observable<unknown> {
    const signer = this.sessionQuery.signer

    if (!signer) return EMPTY

    return this.metamaskSubsignerService.watchAsset(signer, this.value)
  }
}
