import {Injectable} from '@angular/core'
import {combineLatest, defer, Observable, of} from 'rxjs'
import {RampInstantEvents, RampInstantEventTypes, RampInstantSDK} from '@ramp-network/ramp-instant-sdk'
import {SessionQuery} from '../session/state/session.query'
import {ToUrlIPFSPipe} from '../shared/pipes/to-url-ipfs.pipe'
import {PreferenceQuery} from '../preference/state/preference.query'
import {switchMap, take} from 'rxjs/operators'
import {IssuerService} from '../shared/services/blockchain/issuer/issuer.service'

@Injectable({
  providedIn: 'root',
})
export class DepositRampService {
  address$ = this.sessionQuery.address$
  issuer$ = this.issuerService.issuer$

  isAvailable$: Observable<boolean> = defer(() => of(!!this.preferenceQuery.network.ramp))

  constructor(private sessionQuery: SessionQuery,
              private issuerService: IssuerService,
              private toUrlIpfsPipe: ToUrlIPFSPipe,
              private preferenceQuery: PreferenceQuery) {
  }

  showWidget(depositAmount: number): Observable<RampInstantEvents> {
    return combineLatest([
      this.issuer$, this.address$,
    ]).pipe(take(1),
      switchMap(([issuer, address]) => {
        return new Observable<RampInstantEvents>(observer => {
          const rampConfig = this.preferenceQuery.network.ramp

          if (!rampConfig) {
            observer.error('Ramp network not configured for this network.')
            return
          }

          new RampInstantSDK({
            hostAppName: issuer.infoData.name,
            hostLogoUrl: this.toUrlIpfsPipe.transform(issuer.infoData.logo),
            hostApiKey: issuer.infoData.rampApiKey,
            swapAsset: rampConfig.swapAsset,
            fiatCurrency: rampConfig.fiatCurrency,
            fiatValue: depositAmount.toString(),
            userAddress: address,
            url: rampConfig.url,
            variant: 'auto',
          })
            .on('*', event => {
              observer.next(event as any)
              if (event.type === RampInstantEventTypes.WIDGET_CLOSE) {
                observer.complete()
              }
            })
            .show()
        })
      }),
    )
  }
}
