import {Injectable} from '@angular/core'
import {Observable, of, throwError} from 'rxjs'
import {MatDialog, MatDialogConfig} from '@angular/material/dialog'
import {
  DialogIcon,
  InfoDialogComponent,
  InfoDialogData,
  InfoDialogResponse,
} from '../components/info-dialog/info-dialog.component'
import {finalize, map, switchMap} from 'rxjs/operators'
import {LoadingDialogComponent, LoadingDialogData} from '../components/loading-dialog/loading-dialog.component'
import {
  LoadingDialogApprovalComponent,
  LoadingDialogApprovalData,
} from '../components/loading-dialog/loading-dialog-approval/loading-dialog-approval.component'
import {
  LoadingDialogTransactionComponent,
  LoadingDialogTransactionData,
} from '../components/loading-dialog/loading-dialog-transaction/loading-dialog-transaction.component'
import {LoadingOverlayComponent} from '../components/loading-dialog/loading-overlay/loading-overlay.component'

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  readonly configDefaults: Partial<MatDialogConfig> = {
    minWidth: 320,
    panelClass: 'mat-rounded-4xl',
  }

  constructor(public dialog: MatDialog) {
  }

  info(message: string, cancelable = true): Observable<boolean> {
    return this.dialog.open(InfoDialogComponent, {
      ...this.configDefaults,
      data: {
        message,
        cancelable,
      } as InfoDialogData<unknown>,
      disableClose: !cancelable,
    }).afterClosed().pipe(
      map(res => !!(res as InfoDialogResponse<unknown>)?.confirmed),
    )
  }

  infoWithOnConfirm<T>(data: Partial<InfoDialogData<T>>): Observable<InfoDialogResponse<T>> {
    return this.dialog.open(InfoDialogComponent, {
      ...this.configDefaults,
      data,
    }).afterClosed().pipe(
      map(res => res ?? {confirmed: false}),
    )
  }

  success(message: string): Observable<void> {
    return this.dialog.open(InfoDialogComponent, {
      ...this.configDefaults,
      data: {
        icon: DialogIcon.SUCCESS,
        title: 'Success',
        message,
        cancelable: false,
      } as InfoDialogData<unknown>,
    }).afterClosed()
  }

  error(message: string): Observable<void> {
    return this.dialog.open(InfoDialogComponent, {
      ...this.configDefaults,
      data: {
        icon: DialogIcon.ERROR,
        title: 'Error',
        message,
        cancelable: false,
      } as InfoDialogData<unknown>,
    }).afterClosed()
  }

  loading<T>(obs$: Observable<T>, title: string, message?: string, opts?: MatDialogConfig): Observable<T> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      ...this.configDefaults,
      ...opts,
      data: {title, message} as LoadingDialogData,
      disableClose: true,
      maxWidth: opts?.width,
      panelClass: opts?.panelClass !== undefined ? opts.panelClass : 'mat-rounded-4xl',
    })

    return obs$.pipe(
      finalize(() => dialogRef.close()),
    )
  }

  overlayLoading<T>(obs$: Observable<T>): Observable<T> {
    const dialogRef = this.dialog.open(LoadingOverlayComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      disableClose: true,
    })

    return obs$.pipe(
      finalize(() => dialogRef.close()),
    )
  }

  waitingApproval<T>(obs$: Observable<T>, title?: string, message?: string, opts?: MatDialogConfig): Observable<T> {
    const dialogRef = this.dialog.open(LoadingDialogApprovalComponent, {
      ...this.configDefaults,
      ...opts,
      data: {title, message} as LoadingDialogApprovalData,
      disableClose: true,
    })

    return obs$.pipe(
      finalize(() => dialogRef.close()),
    )
  }

  waitingTransaction<T>(obs$: Observable<T>, title?: string, message?: string, opts?: MatDialogConfig): Observable<T> {
    const dialogRef = this.dialog.open(LoadingDialogTransactionComponent, {
      ...this.configDefaults,
      ...opts,
      data: {title, message} as LoadingDialogTransactionData,
      disableClose: true,
    })

    return obs$.pipe(
      finalize(() => dialogRef.close()),
    )
  }

  withPermission<T>(action$: Observable<T>) {
    return this.infoWithOnConfirm({
      message: 'Permission required to open external window.',
      confirm_text: 'Open',
      cancelable: false,
      onConfirm: action$,
    }).pipe(
      switchMap(res => res.confirmed ? of(res.onConfirmResult) :
        throwError(() => 'PERMISSION_POPUP_DISMISSED')),
    )
  }
}
