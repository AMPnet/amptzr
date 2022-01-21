import {Inject, Injectable} from '@angular/core'
import {DOCUMENT} from '@angular/common'
import {IssuerService} from './blockchain/issuer/issuer.service'
import {combineLatest, Observable, of, switchMap, tap} from 'rxjs'
import {distinctUntilChanged, map, shareReplay} from 'rxjs/operators'
import {getWindow} from '../utils/browser'

@Injectable({
  providedIn: 'root',
})
export class CrispService {
  isAvailable$ = combineLatest([this.issuerService.issuer$]).pipe(
    map(([issuer]) => issuer.infoData.crispWebsiteId),
    distinctUntilChanged(),
    switchMap(id => !!id ? this.loadScript(id).pipe(
      map(() => true),
      shareReplay(1),
    ) : of(false)),
  )

  keepShown$ = this.isAvailable$.pipe(
    tap({
      next: v => {
        // this.chatShow()
        console.log('next')
      },
      finalize: () => {
        console.log('finalize')
        this.chatHide()
      },
    }),
  )

  constructor(@Inject(DOCUMENT) private document: any,
              private issuerService: IssuerService) {
  }

  private get $crisp() {
    return getWindow().$crisp
  }

  chatOpen() {
    this.$crisp.push(["do", "chat:open"])
  }

  chatClose() {
    this.$crisp.push(["do", "chat:close"])
  }

  chatShow() { // visible
    this.$crisp.push(["do", "chat:show"])
  }

  chatHide() { // invisible
    this.$crisp.push(["do", "chat:hide"])
  }

  private loadScript(crispWebsiteId: string): Observable<void> {
    return new Observable(subscriber => {
      const head = this.document.getElementsByTagName('head')[0]

      const script: HTMLScriptElement = this.document.createElement('script')
      script.type = 'text/javascript'
      script.innerHTML = `
      window.$crisp=[];
      window.CRISP_WEBSITE_ID="${crispWebsiteId}";
      (function(){
      d=document;s=d.createElement("script");
      s.src="https://client.crisp.chat/l.js";
      s.async=1;d.getElementsByTagName("head")[0].appendChild(s);
      })();
      `
      script.onload = () => {
        subscriber.next()
        subscriber.complete()
      }
      script.onerror = () => {
        subscriber.error()
        subscriber.complete()
      }

      head.appendChild(script)
    })
  }
}
