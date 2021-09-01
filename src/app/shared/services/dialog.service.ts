import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {MatDialog, MatDialogConfig} from '@angular/material/dialog'
import {
  DialogIcon,
  InfoDialogComponent,
  InfoDialogData,
  InfoDialogResponse,
} from '../components/info-dialog/info-dialog.component'
import {finalize, map} from 'rxjs/operators'
import {LoadingDialogComponent, LoadingDialogData} from '../components/loading-dialog/loading-dialog.component'

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {
  }

  info(message: string, cancelable = true): Observable<boolean> {
    return this.dialog.open(InfoDialogComponent, {
      data: {
        message,
        cancelable,
      } as InfoDialogData,
    }).afterClosed().pipe(
      map(res => !!(res as InfoDialogResponse<unknown>)?.confirmed),
    )
  }

  infoWithOnConfirm<T>(message: string, cancelable = true, onConfirm: Observable<T>): Observable<InfoDialogResponse<T>> {
    return this.dialog.open(InfoDialogComponent, {
      data: {
        message,
        cancelable,
        onConfirm,
      } as InfoDialogData,
    }).afterClosed().pipe(
      map(res => res ?? {confirmed: false}),
    )
  }

  success(message: string): Observable<void> {
    return this.dialog.open(InfoDialogComponent, {
      data: {
        title: 'Success',
        message,
        cancelable: false,
      } as InfoDialogData,
    }).afterClosed()
  }

  error(message: string): Observable<void> {
    return this.dialog.open(InfoDialogComponent, {
      data: {
        icon: DialogIcon.ERROR,
        title: 'Error',
        message,
        cancelable: false,
      } as InfoDialogData,
    }).afterClosed()
  }

  loading<T>(obs$: Observable<T>, message: string, opts?: MatDialogConfig): Observable<T> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      ...opts,
      data: {message} as LoadingDialogData,
      disableClose: true,
      minWidth: 320,
      maxWidth: opts?.width,
    })

    return obs$.pipe(
      finalize(() => dialogRef.close()),
    )
  }

  overlayLoading<T>(obs$: Observable<T>, message: string): Observable<T> {
    return this.loading(obs$, message, {
      width: '100vw',
      height: '100vh',
    })
  }
}
