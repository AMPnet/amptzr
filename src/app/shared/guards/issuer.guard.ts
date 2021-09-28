import {Inject, Injectable} from '@angular/core'
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router'
import {combineLatest, Observable, of} from 'rxjs'
import {switchMap, take, tap} from 'rxjs/operators'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {PreferenceStore} from '../../preference/state/preference.store'
import {IssuerService} from '../services/blockchain/issuer.service'
import {SessionQuery} from '../../session/state/session.query'
import {environment} from '../../../environments/environment'
import {StablecoinService} from '../services/blockchain/stablecoin.service'
import {DialogService} from '../services/dialog.service'
import {IpfsService} from '../services/ipfs/ipfs.service'
import {IssuerPathPipe} from '../pipes/issuer-path.pipe'
import {getWindow} from '../utils/browser'
import {DOCUMENT} from '@angular/common'
import {resolveAddress} from '../utils/ethersjs'

@Injectable({
  providedIn: 'root',
})
export class IssuerGuard implements CanActivate {
  constructor(private preferenceQuery: PreferenceQuery,
              private preferenceStore: PreferenceStore,
              private sessionQuery: SessionQuery,
              private stablecoin: StablecoinService,
              private dialogService: DialogService,
              private ipfsService: IpfsService,
              private issuerService: IssuerService,
              private issuerPathPipe: IssuerPathPipe,
              @Inject(DOCUMENT) private doc: any) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const activation$ = of(environment.fixed.issuer || route.params.issuer as string).pipe(
      // TODO: handle error cases
      // TODO: handle getting issuers also by id (number)
      switchMap(issuer => resolveAddress(issuer, this.issuerService.getAddressByName(issuer))),
      switchMap(issuerAddress => this.issuerService.getState(issuerAddress, this.sessionQuery.provider)),
      tap(issuer => this.preferenceStore.update({
        issuer: {
          address: issuer.contractAddress,
          slug: issuer.ansName,
          // TODO: use this to reset stale issuer in preference when issuerFactory address changes.
          // we should automatically log out the current user in this case.
          createdByAddress: issuer.createdBy,
        },
      })),
      tap(issuer => this.setupManifest(issuer.contractAddress).subscribe()),
      // this is needed to reload the latest issuer config
      switchMap(() => combineLatest([this.stablecoin.contract$]).pipe(take(1))),
      switchMap(() => of(true)),
    )

    return this.dialogService.overlayLoading(activation$, '')
  }

  private setupManifest(issuerAddress: string) {
    return this.issuerService.getIssuerWithInfo(issuerAddress).pipe(
      tap(issuer => {
        const manifest = {
          name: issuer.name,
          short_name: issuer.name,
          description: '',
          start_url: `${getWindow().location.origin}${this.issuerPathPipe.transform('/')}`,
          background_color: '#fff',
          theme_color: '#3730A3FF',
          display: 'standalone',
          icons: [
            {
              src: `${getWindow().location.origin}/assets/icons/icon-72x72.png`,
              sizes: '72x72',
              type: 'image/png',
            },
          ],
        }

        const stringManifest = JSON.stringify(manifest)
        const blob = new Blob([stringManifest], {type: 'application/json'})
        const manifestURL = URL.createObjectURL(blob)

        const linkEl = this.doc.querySelector('#app-manifest')

        if (linkEl) {
          linkEl.setAttribute('href', manifestURL)
        } else {
          const head = this.doc.getElementsByTagName('head')[0]
          const link = this.doc.createElement('link')
          link.id = 'app-manifest'
          link.rel = 'manifest'
          link.href = manifestURL
          head.appendChild(link)
        }
      }),
    )
  }
}
