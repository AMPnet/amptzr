import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild} from '@angular/core'
import {PreferenceQuery} from '../preference/state/preference.query'
import {SessionQuery} from '../session/state/session.query'
import {fromEvent, merge, tap} from 'rxjs'
import {getWindow} from '../shared/utils/browser'
import {SignerService} from '../shared/services/signer.service'

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwapComponent implements AfterViewInit {
  readonly url = 'https://uni-widget-iframe.vercel.app'

  @ViewChild('iframe') iframe!: ElementRef<HTMLIFrameElement>

  jsonRpcMessage$ = fromEvent<MessageEvent>(getWindow(), 'message').pipe(
    tap(e => {
      if (e.origin !== this.url || !e.data.jsonrpc || !this.sessionQuery.signer) return

      const request = e.data.method

      this.sessionQuery.signer.provider.send(
        request?.method, request?.params || [],
      ).then(result => {
        this.iframe.nativeElement.contentWindow!.postMessage({
          jsonrpc: e.data.jsonrpc,
          id: e.data.id,
          result,
        }, this.url)
      })
    }),
  )

  signerChanges$ = merge(
    this.preferenceQuery.address$,
    this.signerService.provider$,
  ).pipe(
    tap(_ => {
      this.iframe?.nativeElement?.contentWindow?.postMessage({
        type: 'widgetReload',
      }, this.url)
    }),
  )

  constructor(private preferenceQuery: PreferenceQuery,
              private sessionQuery: SessionQuery,
              private signerService: SignerService) {
  }

  ngAfterViewInit() {
    const iframe = this.iframe.nativeElement

    fromEvent<Event>(iframe, 'load').pipe(
      tap(() => {
        iframe.contentWindow!.postMessage({
          type: 'widgetConfig',
          config: {
            jsonRpcEndpoint: this.preferenceQuery.network.rpcURLs[0],
            tokenList: 'https://tokens.uniswap.org/',
          },
        }, this.url)
      }),
    ).subscribe()

    iframe.setAttribute('src', this.url)
  }
}
