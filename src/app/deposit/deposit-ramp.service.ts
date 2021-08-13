import {Injectable} from '@angular/core'
import {IssuerService} from '../shared/services/blockchain/issuer.service'
import {combineLatest, Observable} from 'rxjs'
import {RampInstantEvents, RampInstantEventTypes, RampInstantSDK} from '@ramp-network/ramp-instant-sdk'
import {SessionQuery} from '../session/state/session.query'
import {ToUrlIPFSPipe} from '../shared/pipes/to-url-ipfs.pipe'
import {PreferenceQuery} from '../preference/state/preference.query'
import {switchMap, take} from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class DepositRampService {
  address$ = this.sessionQuery.address$
  issuer$ = this.issuerService.issuer$

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
          new RampInstantSDK({
            hostAppName: issuer.name,
            hostLogoUrl: this.toUrlIpfsPipe.transform(issuer.logo),
            swapAsset: this.preferenceQuery.network.ramp.swapAsset,
            fiatCurrency: this.preferenceQuery.network.ramp.fiatCurrency,
            fiatValue: depositAmount.toString(),
            userAddress: address,
            url: this.preferenceQuery.network.ramp.url,
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
