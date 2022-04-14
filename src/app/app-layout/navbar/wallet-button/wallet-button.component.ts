import {ChangeDetectionStrategy, Component} from '@angular/core'
import {AuthProvider} from 'src/app/preference/state/preference.store'
import {TailwindService} from "../../../shared/services/tailwind.service"
import {map, startWith} from "rxjs/operators"
import {Observable} from "rxjs"
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {WalletConnectSubsignerService} from '../../../shared/services/subsigners/walletconnect-subsigner.service'

@Component({
  selector: 'app-wallet-button',
  templateUrl: './wallet-button.component.html',
  styleUrls: ['./wallet-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletButtonComponent {
  address$ = this.preferenceQuery.address$
  authProvider$ = this.preferenceQuery.authProvider$
  authProviderIconSize$: Observable<number>
  AuthProvider = AuthProvider

  constructor(private preferenceQuery: PreferenceQuery,
              public walletConnectSubsignerService: WalletConnectSubsignerService,
              private tailwindService: TailwindService) {
    this.authProviderIconSize$ = this.tailwindService.screenResize$.pipe(
      startWith(this.tailwindService.getScreen()),
      map(screen => screen !== ('xxs' || 'xs' || 'sm' || 'md') ? 24 : 36),
    )
  }
}
