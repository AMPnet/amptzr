import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild} from '@angular/core'
import {PreferenceQuery} from '../preference/state/preference.query'
import {SessionQuery} from '../session/state/session.query'
import {EMPTY, fromEvent, merge, Observable, of, switchMap, tap} from 'rxjs'
import {getWindow} from '../shared/utils/browser'
import {SignerService} from '../shared/services/signer.service'
import {hexlify, isHexString} from 'ethers/lib/utils'
import {DialogService} from '../shared/services/dialog.service'
import {HttpClient} from '@angular/common/http'
import {catchError, map, timeout} from 'rxjs/operators'

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwapComponent implements AfterViewInit {
  // TODO: extract it to env variable
  readonly url = 'https://uni-widget-iframe.vercel.app'
  // readonly url = 'http://localhost:3000'

  @ViewChild('iframe') iframe!: ElementRef<HTMLIFrameElement>

  jsonRpcMessage$ = fromEvent<MessageEvent>(getWindow(), 'message').pipe(
    tap(e => {
      if (e.origin !== this.url || !e.data.jsonrpc || !this.sessionQuery.signer) return

      const request = e.data.method!

      of(request.method).pipe(
        switchMap(method => method === 'eth_sendTransaction' ?
          this.getTextSignature(request.params[0].data).pipe(
            switchMap(funcName => this.dialogService.withPermission({
              title: 'Send transaction',
              message: `You are about to send transaction with ${funcName ?? 'unknown'} signature. Are you sure?`,
              confirmText: 'Proceed',
            })),
          ) : of(method),
        ),
        switchMap(() => this.sessionQuery.signer?.provider?.send(
          request.method, request.params || [],
        ) || EMPTY),
        tap(result => {
          if (request.method === 'eth_chainId' && !isHexString(result)) { // WalletConnect issue
            result = hexlify(result)
          }

          this.iframe.nativeElement.contentWindow!.postMessage({
            jsonrpc: e.data.jsonrpc,
            id: e.data.id,
            result,
          }, this.url)
        }),
      ).subscribe()
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
              private dialogService: DialogService,
              private http: HttpClient,
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

  getTextSignature(data: string): Observable<string | undefined> {
    const code = data?.substring(0, 10)
    if (!code) return of(undefined)

    return this.http.get<SignatureList>(
      `https://www.4byte.directory/api/v1/signatures/?hex_signature=${code}`,
    ).pipe(
      timeout(3000),
      map(res => res.count > 0 ?
        res.results.sort((a, b) => a.id - b.id)[0].text_signature :
        undefined,
      ),
      catchError(() => of(undefined)),
    )
  }
}

interface SignatureList {
  count: number;
  next?: any;
  previous?: any;
  results: SignatureResult[];
}

interface SignatureResult {
  id: number;
  created_at: Date;
  text_signature: string;
  hex_signature: string;
  bytes_signature: string;
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
