import { Injectable } from '@angular/core'
import { EMPTY, Observable, of, throwError } from 'rxjs'
import { catchError, switchMap, tap } from 'rxjs/operators'
import { HttpErrorResponse } from '@angular/common/http'
import { JwtTokenService } from './backend/jwt-token.service'
import { DialogService } from './dialog.service'
import { RouterService } from './router.service'

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(
    private router: RouterService,
    private dialogService: DialogService,
    private jwtTokenService: JwtTokenService
  ) {}

  handleError(completeAfterAction = true, rethrowAfterAction = false) {
    return <T>(source: Observable<T>): Observable<T> => {
      return source.pipe(
        catchError(this.processError(completeAfterAction, rethrowAfterAction))
      )
    }
  }

  private processError<T>(
    completeAfterAction: boolean,
    rethrowAfterAction: boolean
  ) {
    return (err: any, caught: Observable<T>) => {
      let errorRes = err as HttpErrorResponse
      let action$: Observable<any> = throwError(err)

      if (!!(errorRes as any)?.code && (errorRes as any)?.code !== -32603) {
        errorRes = errorRes.error
      }

      if (errorRes.error instanceof ErrorEvent) {
        // client-side error
        return action$
      } else if (errorRes.status === 400) {
        // server-side error
        let error: BackendError
        if (errorRes.error?.constructor === ArrayBuffer) {
          const str = String.fromCharCode.apply(
            null,
            new Uint8Array(errorRes.error) as unknown as number[]
          )
          error = JSON.parse(str)
        } else {
          error = errorRes.error
        }

        switch (error?.err_code) {
          case AuthError.INVALID_JWT:
            action$ = this.jwtTokenService.refreshAccessToken().pipe(
              this.handleError(),
              switchMap(() => caught)
            )
            completeAfterAction = false
            break

          case AuthError.MISSING_JWT:
          case AuthError.CANNOT_REGISTER_JWT:
          case AuthError.INVALID_REFRESH_TOKEN:
          case UserError.MISSING_JWT_ADDRESS:
            action$ = of(this.jwtTokenService.removeTokens()).pipe(
              tap(() => this.router.navigate(['/']))
            )
            break

          case undefined:
          default:
            action$ = this.displayMessage(error.message)
        }
      } else if ((errorRes as any).code === -32603) {
        // Internal JSON-RPC error
        const error = errorRes as unknown as EthereumRpcError<
          EthereumRpcError<string>
        >
        const message =
          (error as any).rawMessage ||
          (error as any).data?.originalError?.message ||
          error.data?.message ||
          error.message

        if (
          message?.includes('gas required exceeds allowance') ||
          message?.includes('insufficient funds')
        ) {
          action$ = this.displayMessage(this.outOfGasMessage)
        } else if(message.startsWith('Internal JSON-RPC error.')) {
          action$ = this.displayMessage(error.data?.message ?? "Unknown error")
        }  else if (message?.startsWith('execution reverted:')) {
          action$ = this.displayMessage(
            message!.replace('execution reverted:', '').trim()
          )
        } else {
          action$ = this.displayMessage('Something went wrong.')
        }
      } else if (err?.message?.includes('cannot estimate gas')) {
        action$ = this.displayInfoMessage(this.cannotEstimateGas(err))
      } else if((errorRes as any).code === 'UNPREDICTABLE_GAS_LIMIT') {
        const error = errorRes as unknown as EthereumRpcError<
          EthereumRpcError<string>
        >
        action$ = this.displayMessage(error.data?.message ?? "Unknown error")
      }

      if (completeAfterAction) {
        return action$.pipe(switchMap(() => EMPTY))
      } else {
        if (rethrowAfterAction) {
          return action$.pipe(switchMap(() => throwError(err)))
        } else {
          return action$
        }
      }
    }
  }

  private displayInfoMessage(message: string) {
    return this.dialogService.infoWithOnConfirm({
      message: message.replace('execution reverted:', '').trim(),
      cancelable: false
    })
  }

  private displayMessage(message: string) {
    return this.dialogService.error({ message })
  }

  private get outOfGasMessage() {
    return `You don't have enough gas token to execute this transaction. Click the 'Top Up' button on the top to buy more gas!`
  }

  private cannotEstimateGas(err: any) {
    return `You are not able to execute this transaction. This is the error: \n ${err.error.error.message}`
  }
}

interface BackendError {
  description: string
  message: string
  err_code: RegistrationError | AuthError | UserError
  errors: { [key: string]: string }
}

interface EthereumRpcError<T> {
  code: number
  message?: string
  data?: T
}

export enum RegistrationError {
  INCOMPLETE = '0101',
  EMAIL_TOKEN_EXPIRED = '0105',
  VERIFF_SESSION_MISSING = '0111',
}

export enum AuthError {
  INVALID_JWT = '0204',
  MISSING_JWT = '0205',
  CANNOT_REGISTER_JWT = '0206',
  INVALID_REFRESH_TOKEN = '0208',
  PAYLOAD_MISSING = '0209',
  INVALID_SIGNED_PAYLOAD = '0210',
}

export enum UserError {
  MISSING_JWT_ADDRESS = '0301',
}
