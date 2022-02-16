import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild} from '@angular/core'
import {PreferenceQuery} from '../preference/state/preference.query'
import {SessionQuery} from '../session/state/session.query'
import {fromEvent, merge, tap} from 'rxjs'
import {getWindow} from '../shared/utils/browser'
import {SignerService} from '../shared/services/signer.service'
import {hexlify, isHexString} from 'ethers/lib/utils'

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
        if (request.method === 'eth_chainId' && !isHexString(result)) { // WalletConnect issue
          result = hexlify(result)
        }

        this.iframe.nativeElement.contentWindow!.postMessage({
          jsonrpc: e.data.jsonrpc,
          id: e.data.id,
          result,
        }, this.url)
      })
    }),
  )

  widgetMessage$ = fromEvent<MessageEvent>(getWindow(), 'message').pipe(
    tap(event => {
      const data = event.data as WidgetEventMessageOutputData
      if (data.target !== 'swapWidget') return

      switch (data.method) {
        case 'onConnectWallet':
          return this.signerService.ensureAuth.subscribe()
        case 'onError':
          return console.error(data.payload.error, data.payload.info)
      }
    }),
  )

  signerChange$ = merge(
    this.preferenceQuery.address$,
    this.signerService.provider$,
  ).pipe(
    tap(_ => {
      this.iframe?.nativeElement?.contentWindow?.postMessage(
        inputMessage('reload'), this.url,
      )
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
        iframe.contentWindow!.postMessage(
          inputMessage('setConfig', {
            jsonRpcEndpoint: this.preferenceQuery.network.rpcURLs[0],
            tokenList: 'https://tokens.uniswap.org/',
          }), this.url,
        )
      }),
    ).subscribe()

    iframe.setAttribute('src', this.url)
  }
}

function inputMessage(method: WidgetInputMethod, payload?: any): WidgetEventMessageInputData {
  return {
    target: 'swapWidget',
    method,
    payload,
  }
}

interface WidgetEventMessageInputData {
  target: 'swapWidget'
  method: WidgetInputMethod
  payload?: any
}

interface WidgetEventMessageOutputData {
  target: 'swapWidget'
  method: WidgetOutputMethod
  payload?: any
}

type WidgetInputMethod = 'reload' | 'setConfig'
type WidgetOutputMethod = 'onConnectWallet' | 'onError'
