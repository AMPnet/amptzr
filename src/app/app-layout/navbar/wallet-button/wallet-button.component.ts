import {Component, ChangeDetectionStrategy} from '@angular/core'
import {SessionQuery} from "../../../session/state/session.query"
import {AuthProvider} from 'src/app/preference/state/preference.store'
import {TailwindService} from "../../../shared/services/tailwind.service"
import {map, startWith} from "rxjs/operators"
import {Observable} from "rxjs"

@Component({
  selector: 'app-wallet-button',
  templateUrl: './wallet-button.component.html',
  styleUrls: ['./wallet-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletButtonComponent {

  address$ = this.sessionQuery.address$
  authProvider$ = this.sessionQuery.authProvider$
  authProviderIconSize$: Observable<number>
  AuthProvider = AuthProvider

  constructor(private sessionQuery: SessionQuery,
              private tailwindService: TailwindService) {
    this.authProviderIconSize$ = this.tailwindService.screenResize$.pipe(
      startWith(this.tailwindService.getScreen()),
      map(screen => screen !== ('sm' || 'md') ? 24 : 36),
    )
  }

}
