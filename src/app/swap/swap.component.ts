import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ɵmarkDirty,
} from '@angular/core'
import { PreferenceQuery } from '../preference/state/preference.query'
import { SessionQuery } from '../session/state/session.query'
import {
  concatMap,
  EMPTY,
  fromEvent,
  merge,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs'
import { getWindow } from '../shared/utils/browser'
import { SignerService } from '../shared/services/signer.service'
import { hexlify, isHexString } from 'ethers/lib/utils'
import { DialogService } from '../shared/services/dialog.service'
import { FunctionSignatureService } from '../shared/services/blockchain/function-signature.service'
import { AuthProvider } from '../preference/state/preference.store'
import { switchMapTap } from '../shared/utils/observables'
import { TokenListService } from '../shared/services/blockchain/token-list.service'
import { catchError } from 'rxjs/operators'

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwapComponent implements AfterViewInit {
  // TODO: extract it to env variable
  readonly url = 'https://uni-widget-iframe.vercel.app'

  @ViewChild('iframe') iframe!: ElementRef<HTMLIFrameElement>

  jsonRpcMessage$ = fromEvent<MessageEvent>(getWindow(), 'message').pipe(
    concatMap((e) => {
      if (e.origin !== this.url || !e.data.jsonrpc || !this.sessionQuery.signer)
        return of(undefined)

      const request = e.data.method!

      return of(request.method).pipe(
        this.optionalPermission(request.method, request.params),
        switchMap(
          () =>
            this.sessionQuery.signer?.provider?.send(
              request.method,
              request.params || []
            ) || EMPTY
        ),
        tap({
          next: (result) => {
            // workaround for a signer that diverges from the standard
            if (request.method === 'eth_chainId' && !isHexString(result)) {
              result = hexlify(result)
            }

            this.iframe.nativeElement.contentWindow?.postMessage(
              {
                jsonrpc: e.data.jsonrpc,
                id: e.data.id,
                result,
              },
              this.url
            )
          },
          error: (err) => {
            const error =
              !!err.code && !!err.message
                ? err
                : {
                    code: -32603,
                    message: 'internal error',
                    data: err,
                  }

            this.iframe.nativeElement.contentWindow?.postMessage(
              {
                jsonrpc: e.data.jsonrpc,
                id: e.data.id,
                error,
              },
              this.url
            )
          },
        }),
        catchError(() => EMPTY)
      )
    })
  )

  widgetMessage$ = fromEvent<MessageEvent>(getWindow(), 'message').pipe(
    tap((event) => {
      const data = event.data as WidgetEventMessageOutputData
      if (data.target !== 'swapWidget') return

      switch (data.method) {
        case 'onConnectWallet':
          return this.signerService.ensureAuth.subscribe()
        case 'onError':
          return console.error(data.payload.error, data.payload.info)
      }
    })
  )

  signerChange$ = merge(
    this.preferenceQuery.address$,
    this.signerService.provider$,
    this.signerService.chainChanged$
  ).pipe(
    tap((_) => {
      this.iframe?.nativeElement?.contentWindow?.postMessage(
        inputMessage('reload'),
        this.url
      )
    })
  )

  ensureNetwork$ = this.signerService.ensureNetwork$
  setConfig$!: Observable<unknown>

  constructor(
    private preferenceQuery: PreferenceQuery,
    private sessionQuery: SessionQuery,
    private dialogService: DialogService,
    private functionSignatureService: FunctionSignatureService,
    private tokenListService: TokenListService,
    private signerService: SignerService
  ) {}

  ngAfterViewInit() {
    const iframe = this.iframe.nativeElement

    this.setConfig$ = merge(
      fromEvent<Event>(iframe, 'load'),
      this.signerChange$
    ).pipe(
      switchMap(() =>
        this.tokenListService.fetchListsWithAssets([
          'https://tokens.uniswap.org',
        ])
      ),
      tap((tokenList) => {
        iframe.contentWindow?.postMessage(
          inputMessage('setConfig', {
            jsonRpcEndpoint: this.preferenceQuery.network.rpcURLs[0],
            tokenList: tokenList,
          }),
          this.url
        )
      }),
      tap(() => ɵmarkDirty(this))
    )

    iframe.setAttribute('src', this.url)
  }

  private optionalPermission<T>(method: string, params: any) {
    const shouldShowPermission =
      method === 'eth_sendTransaction' &&
      this.preferenceQuery.getValue().authProvider === AuthProvider.MAGIC

    return (source: Observable<T>): Observable<T> => {
      return source.pipe(
        switchMapTap(() =>
          shouldShowPermission
            ? this.showPermission(params[0]?.data)
            : of(undefined)
        )
      )
    }
  }

  private showPermission(data: any) {
    return this.functionSignatureService.fromHex(data).pipe(
      switchMap((funcName) =>
        this.dialogService.withPermission({
          title: 'Send transaction',
          message: `You are about to send transaction with ${
            funcName ?? 'unknown'
          } signature. Are you sure?`,
          confirmText: 'Proceed',
        })
      )
    )
  }
}

function inputMessage(
  method: WidgetInputMethod,
  payload?: any
): WidgetEventMessageInputData {
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
