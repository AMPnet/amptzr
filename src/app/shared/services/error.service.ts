import {Injectable} from '@angular/core'
import {EMPTY, Observable, of, throwError} from 'rxjs'
import {catchError, switchMap, tap} from 'rxjs/operators'
import {HttpErrorResponse} from '@angular/common/http'
import {JwtTokenService} from './backend/jwt-token.service'
import {Router} from '@angular/router'
import {DialogService} from './dialog.service'

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(private router: Router,
              private dialogService: DialogService,
              private jwtTokenService: JwtTokenService) {
  }

  handleError(completeAfterAction = true, rethrowAfterAction = false) {
    return <T>(source: Observable<T>): Observable<T> => {
      return source.pipe(catchError(this.processError(completeAfterAction, rethrowAfterAction)))
    }
  }

  private processError<T>(completeAfterAction: boolean, rethrowAfterAction: boolean) {
    return (err: any, caught: Observable<T>) => {
      const errorRes = err as HttpErrorResponse
      let action$: Observable<any> = throwError(err)

      if (errorRes.error instanceof ErrorEvent) { // client-side error
        return action$
      } else if (errorRes.status === 400) {  // server-side error
        let error: BackendError
        if (errorRes.error?.constructor === ArrayBuffer) {
          const str = String.fromCharCode
            .apply(null, (new Uint8Array(errorRes.error) as unknown as number[]))
          error = JSON.parse(str)
        } else {
          error = errorRes.error
        }

        switch (error?.err_code) {
          case AuthError.INVALID_JWT:
            action$ = this.jwtTokenService.refreshAccessToken().pipe(
              this.handleError(),
              switchMap(() => caught),
            )
            completeAfterAction = false
            break

          case AuthError.MISSING_JWT:
          case AuthError.CANNOT_REGISTER_JWT:
          case AuthError.INVALID_REFRESH_TOKEN:
          case UserError.MISSING_JWT_ADDRESS:
            action$ = of(this.jwtTokenService.removeTokens()).pipe(
              tap(() => this.router.navigate(['/login'])),
            )
            break

          case undefined:
          default:
            action$ = this.displayMessage('Something went wrong.')
        }
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

      return completeAfterAction ? action$.pipe(switchMap(() => EMPTY)) : action$
    }
  }

  private displayMessage(message: string) {
    return this.dialogService.error(message)
  }
}

interface BackendError {
  description: string;
  message: string;
  err_code: RegistrationError | AuthError | UserError;
  errors: { [key: string]: string };
}

export enum RegistrationError {
  INCOMPLETE = '0101',
  EMAIL_TOKEN_EXPIRED = '0105',
  VERIFF_SESSION_MISSING = '0111'
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
  MISSING_JWT_ADDRESS = '0301'
}
