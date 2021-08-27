import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {MatDialog} from '@angular/material/dialog'
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
      map(res => !!(res as InfoDialogResponse)?.confirmed),
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

  loading<T>(obs$: Observable<T>, message: string): Observable<T> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      data: {message} as LoadingDialogData,
    })

    return obs$.pipe(
      finalize(() => dialogRef.close()),
    )
  }
}
