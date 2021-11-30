import {Injectable} from '@angular/core'
import {Subsigner, SubsignerLoginOpts} from './metamask-subsigner.service'
import {combineLatest, defer, EMPTY, from, Observable, of} from 'rxjs'
import {providers} from 'ethers'
import {concatMap, map, switchMap, take, tap} from 'rxjs/operators'
import {AuthProvider, PreferenceStore} from '../../../preference/state/preference.store'
import {PreferenceQuery} from '../../../preference/state/preference.query'
import {MatDialog} from '@angular/material/dialog'
import {IssuerService} from '../blockchain/issuer/issuer.service'
import {getWindow} from '../../utils/browser'
import {SafeAppProvider} from '@gnosis.pm/safe-apps-provider'

@Injectable({
  providedIn: 'root',
})
export class GnosisSubsignerService implements Subsigner {
  subprovider!: SafeAppProvider

  constructor(
    private preferenceStore: PreferenceStore,
    private preferenceQuery: PreferenceQuery,
    private issuerService: IssuerService,
    private matDialog: MatDialog,
  ) {
  }

  login(opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return this.registerGnosis.pipe(
      map(p => new providers.Web3Provider(p as any).getSigner()),
      concatMap(signer => this.setAddress(signer)),
    )
  }

  logout(): Observable<unknown> {
    return EMPTY
  }

  private setAddress(signer: providers.JsonRpcSigner) {
    return from(signer.getAddress()).pipe(
      tap(address => this.preferenceStore.update({
        address: address,
        authProvider: AuthProvider.METAMASK,
      })),
      map(() => signer),
    )
  }

  private get registerGnosis(): Observable<SafeAppProvider> {
    const sdk$ = defer(() =>
      from(import(
        /* webpackChunkName: "safe-apps-sdk" */
        '@gnosis.pm/safe-apps-sdk')),
    )
    const safeProvider$ = defer(() =>
      from(import(
        /* webpackChunkName: "safe-apps-provider" */
        '@gnosis.pm/safe-apps-provider')),
    )

    return combineLatest([sdk$, safeProvider$]).pipe(
      switchMap(([sdkLib, safeProviderLib]) => {
        const sdk = new sdkLib.default()

        return from(sdk.safe.getInfo()).pipe(
          map(safeInfo => new safeProviderLib.SafeAppProvider(safeInfo, sdk)),
          tap(subprovider => this.subprovider = subprovider),
        )
      }),
    )
  }
}
