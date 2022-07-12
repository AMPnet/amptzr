import { Injectable } from '@angular/core'
import {
  combineLatest,
  defer,
  fromEventPattern,
  Observable,
  of,
  scan,
  takeWhile,
  throwError,
} from 'rxjs'
import {
  RampInstantEvents,
  RampInstantEventTypes,
  RampInstantSDK,
} from '@ramp-network/ramp-instant-sdk'
import { ToUrlIPFSPipe } from '../shared/pipes/to-url-ipfs.pipe'
import { PreferenceQuery } from '../preference/state/preference.query'
import { map, switchMap, take } from 'rxjs/operators'
import { IssuerService } from '../shared/services/blockchain/issuer/issuer.service'
import {
  StablecoinBigNumber,
  StablecoinService,
} from '../shared/services/blockchain/stablecoin.service'
import { ConversionService } from '../shared/services/conversion.service'
import { BackendUserService } from '../shared/services/backend/backend-user.service'

@Injectable({
  providedIn: 'root',
})
export class DepositRampService {
  address$ = this.preferenceQuery.address$
  issuer$ = this.issuerService.issuer$

  isAvailable$: Observable<boolean> = defer(() =>
    of(!!this.preferenceQuery.network.ramp)
  )

  constructor(
    private issuerService: IssuerService,
    private toUrlIpfsPipe: ToUrlIPFSPipe,
    private stablecoinService: StablecoinService,
    private conversion: ConversionService,
    private backendUserService: BackendUserService,
    private preferenceQuery: PreferenceQuery
  ) {}

  showWidget(
    depositAmount: StablecoinBigNumber,
    opts?: { setEmail: boolean }
  ): Observable<EventWithState> {
    const email$ = opts?.setEmail
      ? this.backendUserService
          .getUser()
          .pipe(map((user) => (!!user.email ? user.email : '')))
      : of('')

    return combineLatest([this.issuer$, this.address$, email$]).pipe(
      take(1),
      switchMap(([issuer, address, email]) => {
        const rampConfig = this.preferenceQuery.network.ramp
        if (!rampConfig) {
          return throwError(
            () => 'Ramp network is not configured for this network.'
          )
        }

        const rampWindow = new RampInstantSDK({
          hostAppName: issuer.infoData.name,
          hostLogoUrl: this.toUrlIpfsPipe.transform(issuer.infoData.logo),
          hostApiKey: issuer.infoData.rampApiKey,
          swapAsset: rampConfig.swapAsset,
          swapAmount: depositAmount.toString(),
          userAddress: address,
          userEmailAddress: email,
          url: rampConfig.url,
          variant: 'auto',
        })

        rampWindow.show()

        return fromEventPattern<RampInstantEvents>(
          (handler) => rampWindow.on('*', handler),
          (handler) => rampWindow.unsubscribe('*', handler)
        )
      }),
      scan((acc, event) => {
        return {
          purchaseCreated: acc.purchaseCreated
            ? true
            : event.type === RampInstantEventTypes.PURCHASE_CREATED,
          successFinish: acc.successFinish
            ? true
            : event.type === RampInstantEventTypes.WIDGET_CLOSE &&
              !!event.payload,
          event: event,
        } as EventWithState
      }, {} as EventWithState),
      takeWhile(
        (state) => state.event.type !== RampInstantEventTypes.WIDGET_CLOSE,
        true
      )
    )
  }
}

interface EventWithState {
  purchaseCreated: boolean
  successFinish: boolean
  event: RampInstantEvents
}
