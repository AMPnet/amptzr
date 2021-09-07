import {Injectable} from '@angular/core'
import {SignerService} from './signer.service'
import {distinctUntilChanged, map, shareReplay, switchMap} from 'rxjs/operators'
import {BackendHttpClient} from './backend/backend-http-client.service'
import {combineLatest, Observable} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {IssuerService} from './blockchain/issuer.service'

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isAdmin$: Observable<boolean>

  constructor(private signerService: SignerService,
              private sessionQuery: SessionQuery,
              private issuerService: IssuerService,
              private http: BackendHttpClient) {
    this.isAdmin$ = combineLatest([
      this.sessionQuery.isLoggedIn$,
      this.sessionQuery.address$,
      this.issuerService.issuer$,
    ]).pipe(
      map(([isLoggedIn, address, issuer]) => {
        if (!isLoggedIn || !address) {
          return false
        }

        return address.toLowerCase() === issuer.owner.toLowerCase()
      }),
      distinctUntilChanged(),
      shareReplay(1),
    )
  }

  logout() {
    return this.signerService.logout().pipe(
      switchMap(() => this.http.logout()),
    )
  }
}
