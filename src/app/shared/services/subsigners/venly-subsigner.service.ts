import {Injectable} from '@angular/core'
import {defer, from, Observable, of, throwError} from 'rxjs'
import {concatMap, map, tap} from 'rxjs/operators'
import {providers} from 'ethers'
import {Subsigner, SubsignerLoginOpts} from './metamask-subsigner.service'
import {ArkaneConnect, AuthenticationResult} from '@arkane-network/arkane-connect/dist/src/connect/connect'
import {AuthProvider, PreferenceStore} from '../../../preference/state/preference.store'
import {VenlyNetworks} from '../../networks'
import {environment} from '../../../../environments/environment'
import {DialogService} from '../dialog.service'
import {getWindow} from '../../utils/browser'
import {PreferenceQuery} from '../../../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class VenlySubsignerService implements Subsigner {
  subprovider!: ArkaneSubprovider

  isAvailable$: Observable<boolean> = defer(() => of(!!this.preferenceQuery.network.venlyConfig))

  constructor(private preferenceStore: PreferenceStore,
              private preferenceQuery: PreferenceQuery,
              private dialogService: DialogService) {
  }

  login(opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return this.registerArkane().pipe(
      map(p => new providers.Web3Provider(p as any).getSigner()),
      concatMap(signer => this.checkAuthenticated(signer, opts)),
      concatMap(signer => this.setAddress(signer)),
    )
  }

  private registerArkane() {
    return from(import(
      /* webpackChunkName: "@arkane-network/web3-arkane-provider" */
      '@arkane-network/web3-arkane-provider')).pipe(
      concatMap(lib => {
        const venlyConfig = VenlyNetworks[this.preferenceStore.getValue().chainID]

        if (!venlyConfig) {
          return throwError('Venly not configured for this network.')
        }

        return from(lib.Arkane.createArkaneProviderEngine({
          clientId: environment.arkane.clientID,
          skipAuthentication: true,
          secretType: venlyConfig.secretType as any,
          environment: venlyConfig.env,
        }))
      }),
      tap(() => this.subprovider = getWindow().Arkane),
    )
  }

  private checkAuthenticated(signer: providers.JsonRpcSigner,
                             opts: SubsignerLoginOpts): Observable<providers.JsonRpcSigner> {
    return of(opts.force).pipe(
      concatMap(force => force ?
        this.authenticateProcedure() :
        from(this.subprovider.checkAuthenticated())),
      concatMap(authRes => authRes.isAuthenticated ? of(authRes) : throwError('NO_ADDRESS')),
      concatMap(() => of(signer)),
    )
  }

  private authenticateProcedure(): Observable<AuthenticationResult> {
    return this.dialogService.withPermission(defer(() => this.subprovider.authenticate()))
  }

  private setAddress(signer: providers.JsonRpcSigner) {
    return from(signer.getAddress()).pipe(
      tap(address => this.preferenceStore.update({
        address: address,
        authProvider: AuthProvider.VENLY,
      })),
      map(() => signer),
    )
  }

  logout(): Observable<unknown> {
    return of(this.subprovider.arkaneConnect()).pipe(
      tap(arkaneConnect => arkaneConnect.logout()),
    )
  }

  manageWallets() {
    const venlyConfig = VenlyNetworks[this.preferenceStore.getValue().chainID]

    if (!venlyConfig) {
      return throwError('Venly not configured for this network.')
    }

    return of(this.subprovider.arkaneConnect()).pipe(
      concatMap(arkaneConnect => arkaneConnect.manageWallets(
        venlyConfig.secretType,
      )),
    )
  }
}

interface ArkaneSubprovider {
  arkaneConnect(): ArkaneConnect

  checkAuthenticated(): Promise<AuthenticationResult>

  authenticate(): Promise<AuthenticationResult>
}
