import { Inject, Injectable } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { IssuerService } from './blockchain/issuer/issuer.service'
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs'
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators'
import { getWindow } from '../utils/browser'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { BackendUserService } from './backend/backend-user.service'

@Injectable({
  providedIn: 'root',
})
export class CrispService {
  private readonly scriptID = 'crisp-chat-widget'
  private crispSub = new BehaviorSubject<boolean>(false)

  isAvailable$: Observable<boolean>
  keepShown$: Observable<unknown>

  constructor(
    @Inject(DOCUMENT) private document: any,
    private preferenceQuery: PreferenceQuery,
    private backendUserService: BackendUserService,
    private issuerService: IssuerService
  ) {
    const crispWebsiteId$ = combineLatest([
      this.preferenceQuery.issuer$,
      this.issuerService.issuer$,
    ]).pipe(
      map(([prefIssuer, issuer]) =>
        !prefIssuer.address ? undefined : issuer.infoData.crispWebsiteId
      ),
      distinctUntilChanged(),
      tap(() => this.crispSub.next(false)),
      shareReplay(1)
    )

    this.isAvailable$ = this.crispSub.asObservable()

    this.keepShown$ = crispWebsiteId$.pipe(
      switchMap((websiteId) => {
        return !!websiteId
          ? this.loadScript(websiteId).pipe(shareReplay(1))
          : of(false)
      }),
      tap((shouldShow) => this.crispSub.next(shouldShow)),
      shareReplay({ bufferSize: 1, refCount: true }),
      tap({
        next: (shouldShow) => {
          shouldShow ? this.chatShow() : this.chatHide()
        },
        finalize: () => {
          this.chatHide()
        },
      })
    )

    combineLatest([
      this.crispSub.asObservable(),
      this.preferenceQuery.isBackendAuthorized$,
      this.preferenceQuery.address$,
    ])
      .pipe(
        tap(([isCrispAvailable, isBackendAuthorized, address]) => {
          if (!isCrispAvailable) return

          this.setSessionData({
            address: !!address ? `"${address}"` : '',
            authProvider: this.preferenceQuery.getValue().authProvider || '',
          })

          if (isBackendAuthorized) {
            this.backendUserService
              .getUser()
              .pipe(
                tap((user) => {
                  if (!!user.email) this.setUserEmail(user.email)
                })
              )
              .subscribe()
          }
        })
      )
      .subscribe()
  }

  chatShow() {
    // visible
    this.$crisp?.push(['do', 'chat:show'])
  }

  chatHide() {
    // invisible
    this.$crisp?.push(['do', 'chat:hide'])
  }

  chatOpen() {
    this.$crisp?.push(['do', 'chat:open'])
  }

  sessionReset() {
    this.$crisp?.push(['do', 'session:reset'])
  }

  setUserEmail(email: string) {
    this.$crisp?.push(['set', 'user:email', email])
  }

  setSessionData(data: object) {
    this.$crisp?.push(['set', 'session:data', [[...Object.entries(data)]]])
  }

  private get $crisp(): any | undefined {
    return getWindow().$crisp
  }

  private loadScript(crispWebsiteId: string): Observable<boolean> {
    if (this.crispSub.value) return of(true)

    return new Observable<boolean>((subscriber) => {
      getWindow().CRISP_WEBSITE_ID = crispWebsiteId

      if (this.document.getElementById(this.scriptID)) {
        this.sessionReset()
        subscriber.next(true)
        subscriber.complete()
        return
      }

      const head = this.document.getElementsByTagName('head')[0]
      getWindow().$crisp = []
      const script: HTMLScriptElement = this.document.createElement('script')
      script.id = this.scriptID
      script.src = 'https://client.crisp.chat/l.js'
      script.async = true

      script.onload = () => {
        getWindow().CRISP_READY_TRIGGER = () => {
          getWindow().CRISP_READY_TRIGGER = undefined
          subscriber.next(true)
          subscriber.complete()
        }
      }
      script.onerror = () => {
        subscriber.error(false)
        subscriber.complete()
      }

      head.appendChild(script)
    })
  }
}
