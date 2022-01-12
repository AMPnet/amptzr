import {Injectable} from '@angular/core'
import {combineLatest, defer, Observable, of, scan} from 'rxjs'
import {RampInstantEvents, RampInstantEventTypes, RampInstantSDK} from '@ramp-network/ramp-instant-sdk'
import {SessionQuery} from '../session/state/session.query'
import {ToUrlIPFSPipe} from '../shared/pipes/to-url-ipfs.pipe'
import {PreferenceQuery} from '../preference/state/preference.query'
import {switchMap, take} from 'rxjs/operators'
import {IssuerService} from '../shared/services/blockchain/issuer/issuer.service'
import {StablecoinBigNumber, StablecoinService} from '../shared/services/blockchain/stablecoin.service'
import {ConversionService} from '../shared/services/conversion.service'

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
              private stablecoinService: StablecoinService,
              private conversion: ConversionService,
              private preferenceQuery: PreferenceQuery) {
  }

  showWidget(depositAmount: StablecoinBigNumber): Observable<EventWithState> {
    return combineLatest([
      this.issuer$, this.address$,
    ]).pipe(take(1),
      switchMap(([issuer, address]) => {
        return new Observable<RampInstantEvents>(observer => {
          const rampConfig = this.preferenceQuery.network.ramp

          if (!rampConfig) {
            observer.error('Ramp network is not configured for this network.')
            return
          }

          const rampWindow = new RampInstantSDK({
            hostAppName: issuer.infoData.name,
            hostLogoUrl: this.toUrlIpfsPipe.transform(issuer.infoData.logo),
            hostApiKey: issuer.infoData.rampApiKey,
            swapAsset: rampConfig.swapAsset,
            swapAmount: depositAmount.toString(),
            userAddress: address,
            url: rampConfig.url,
            variant: 'auto',
          })

          rampWindow.on('*', event => {
            observer.next(event as any)
            if (event.type === RampInstantEventTypes.WIDGET_CLOSE) {
              observer.complete()
            }
          })

          rampWindow.show()
        })
      }),
      scan((acc, event) => {
        return ({
          purchaseCreated: acc.purchaseCreated ? true :
            event.type === RampInstantEventTypes.PURCHASE_CREATED,
          successFinish: acc.successFinish ? true :
            event.type === RampInstantEventTypes.WIDGET_CLOSE && !!event.payload,
          event: event,
        }) as EventWithState
      }, {
        purchaseCreated: false,
        successFinish: false,
        event: undefined as unknown,
      } as EventWithState),
    )
  }
}

interface EventWithState {
  purchaseCreated: boolean
  successFinish: boolean
  event: RampInstantEvents
}
