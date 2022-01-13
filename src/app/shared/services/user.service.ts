import {Injectable} from '@angular/core'
import {SignerService} from './signer.service'
import {distinctUntilChanged, map, shareReplay, switchMap} from 'rxjs/operators'
import {BackendHttpClient} from './backend/backend-http-client.service'
import {combineLatest, from, Observable} from 'rxjs'
import {SessionQuery} from '../../session/state/session.query'
import {IssuerService} from './blockchain/issuer/issuer.service'
import {BigNumber} from 'ethers'
import {PreferenceQuery} from '../../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isAdmin$: Observable<boolean>
  nativeTokenBalance$: Observable<BigNumber>

  constructor(private signerService: SignerService,
              private sessionQuery: SessionQuery,
              private preferenceQuery: PreferenceQuery,
              private issuerService: IssuerService,
              private http: BackendHttpClient) {
    this.isAdmin$ = combineLatest([
      this.sessionQuery.isLoggedIn$,
      this.preferenceQuery.address$,
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

    this.nativeTokenBalance$ = combineLatest([this.sessionQuery.provider$, this.preferenceQuery.address$]).pipe(
      switchMap(([provider, address]) => from(provider.getBalance(address!))),
      shareReplay({bufferSize: 1, refCount: true}),
    )
  }

  logout() {
    return this.signerService.logout().pipe(
      switchMap(() => this.http.logout()),
    )
  }
}
