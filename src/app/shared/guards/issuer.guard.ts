import { Inject, Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap, take, tap } from 'rxjs/operators'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { PreferenceStore } from '../../preference/state/preference.store'
import { SessionQuery } from '../../session/state/session.query'
import { environment } from '../../../environments/environment'
import { StablecoinService } from '../services/blockchain/stablecoin.service'
import { DialogService } from '../services/dialog.service'
import { IpfsService } from '../services/ipfs/ipfs.service'
import { IssuerPathPipe } from '../pipes/issuer-path.pipe'
import { getWindow } from '../utils/browser'
import { DOCUMENT } from '@angular/common'
import { NameService } from '../services/blockchain/name.service'
import { IssuerService } from '../services/blockchain/issuer/issuer.service'
import { IssuerCommonStateWithName } from '../services/blockchain/query.service'
import { IssuerFlavor } from '../services/blockchain/flavors'

@Injectable({
  providedIn: 'root',
})
export class IssuerGuard implements CanActivate {
  constructor(
    private preferenceQuery: PreferenceQuery,
    private preferenceStore: PreferenceStore,
    private nameService: NameService,
    private sessionQuery: SessionQuery,
    private stablecoin: StablecoinService,
    private dialogService: DialogService,
    private ipfsService: IpfsService,
    private issuerService: IssuerService,
    private issuerPathPipe: IssuerPathPipe,
    @Inject(DOCUMENT) private doc: any
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const activation$ = of(
      environment.fixed.issuer || (route.params.issuer as string)
    ).pipe(
      switchMap((issuer) => this.nameService.getIssuer(issuer)),
      tap((issuer) =>
        this.preferenceStore.update({
          issuer: {
            address: issuer.issuer.contractAddress,
            flavor: issuer.issuer.flavor as IssuerFlavor,
            slug: issuer.mappedName || issuer.issuer.contractAddress,
          },
        })
      ),
      tap((issuer) => this.setupManifest(issuer).subscribe()),
      // this is needed to reload the latest issuer config
      switchMap(() => combineLatest([this.stablecoin.contract$]).pipe(take(1))),
      switchMap(() => of(true))
    )

    return this.dialogService.overlayLoading(activation$)
  }

  private setupManifest(issuer: IssuerCommonStateWithName) {
    return this.issuerService.getIssuerInfo(issuer.issuer).pipe(
      tap((issuer) => {
        const manifest = {
          name: issuer.infoData.name,
          short_name: issuer.infoData.name,
          description: '',
          start_url: `${
            getWindow().location.origin
          }${this.issuerPathPipe.transform('/')}`,
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
        const blob = new Blob([stringManifest], { type: 'application/json' })
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
      })
    )
  }
}
