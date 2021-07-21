import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {MatDialog} from '@angular/material/dialog'
import {InfoDialogComponent, InfoDialogData, InfoDialogResponse} from '../components/info-dialog/info-dialog.component'
import {map} from 'rxjs/operators'

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
      } as InfoDialogData
    }).afterClosed()
  }

  error(message: string): Observable<void> {
    return this.dialog.open(InfoDialogComponent, {
      data: {
        title: 'Error',
        message,
        cancelable: false,
      } as InfoDialogData
    }).afterClosed()
  }
}
