import { Injectable } from '@angular/core'
import { combineLatest, defer, EMPTY, from, Observable } from 'rxjs'
import { providers } from 'ethers'
import { concatMap, map, switchMap, tap, timeout } from 'rxjs/operators'
import {
  AuthProvider,
  PreferenceStore,
} from '../../../preference/state/preference.store'
import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider'
import { SignerLoginOpts, Subsigner } from '../signer-login-options'

@Injectable({
  providedIn: 'root',
})
export class GnosisSubsignerService implements Subsigner<GnosisLoginOpts> {
  subprovider!: SafeAppProvider

  constructor(private preferenceStore: PreferenceStore) {}

  login(opts: GnosisLoginOpts): Observable<providers.JsonRpcSigner> {
    return this.registerGnosis.pipe(
      map((p) => new providers.Web3Provider(p as any).getSigner()),
      concatMap((signer) => this.setAddress(signer))
    )
  }

  logout(): Observable<unknown> {
    return EMPTY
  }

  private setAddress(signer: providers.JsonRpcSigner) {
    return from(signer.getAddress()).pipe(
      tap((address) =>
        this.preferenceStore.update({
          address: address,
          authProvider: AuthProvider.GNOSIS_SAFE,
        })
      ),
      map(() => signer)
    )
  }

  private get registerGnosis(): Observable<SafeAppProvider> {
    const sdk$ = defer(() =>
      from(
        import(
          /* webpackChunkName: "safe-apps-sdk" */
          '@gnosis.pm/safe-apps-sdk'
        )
      )
    )
    const safeProvider$ = defer(() =>
      from(
        import(
          /* webpackChunkName: "safe-apps-provider" */
          '@gnosis.pm/safe-apps-provider'
        )
      )
    )

    return combineLatest([sdk$, safeProvider$]).pipe(
      switchMap(([sdkLib, safeProviderLib]) => {
        const sdk = new sdkLib.default()

        return from(sdk.safe.getInfo())
          .pipe(
            // This is 'the best' way to know if app is running in Gnosis Safe context.
            // Official source: https://github.com/gnosis/safe-apps-sdk/blob/4966a34e1d2bcc6f6caac5e25251510bd7c170cc/packages/safe-apps-web3modal/src/modal.ts#L18-L21
            timeout(200)
          )
          .pipe(
            map(
              (safeInfo) =>
                new safeProviderLib.SafeAppProvider(safeInfo, sdk as any)
            ),
            tap((subprovider) => (this.subprovider = subprovider))
          )
      })
    )
  }
}

interface GnosisLoginOpts extends SignerLoginOpts {
  wallet?: string
}
