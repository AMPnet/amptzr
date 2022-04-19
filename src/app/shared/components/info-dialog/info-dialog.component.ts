import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'
import {BehaviorSubject, Observable, of} from 'rxjs'
import {catchError, tap} from 'rxjs/operators'

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoDialogComponent implements OnInit {
  iconType = DialogIcon
  icons = Object.values(DialogIcon)

  private dataSub = new BehaviorSubject<InfoDialogData<unknown>>({
    icon: DialogIcon.INFO,
    title: '',
    message: '',
    confirm_text: 'OK',
    cancel_text: 'Cancel',
    cancelable: true,
  })
  data$ = this.dataSub.asObservable()

  constructor(@Inject(MAT_DIALOG_DATA) @Optional() public data: InfoDialogData<unknown>,
              @Optional() private dialogRef: MatDialogRef<InfoDialogComponent>) {
  }

  ngOnInit(): void {
    if (!this.data) {
      return
    }

    this.dataSub.next({
      ...this.dataSub.value,
      ...this.data,
    })
  }

  confirm(onConfirm$?: Observable<any>) {
    return () => {
      return onConfirm$ ? onConfirm$.pipe(
        tap(res => this.close(true, res)),
        catchError(err => {
          this.close(false)
          return err
        }),
      ) : of(this.close(true))
    }
  }

  cancel(): void {
    this.close(false)
  }

  private close<T>(confirm: boolean, result?: T) {
    return this.dialogRef.close({confirmed: confirm, onConfirmResult: result} as InfoDialogResponse<T>)
  }
}

export interface InfoDialogData<T> {
  icon: DialogIcon | string
  title: string;
  message: string;
  confirm_text: string;
  cancel_text: string;
  cancelable: boolean;
  onConfirm?: Observable<T>
}

export enum DialogIcon {
  INFO, SUCCESS, ERROR
}

export interface InfoDialogResponse<T> {
  confirmed: boolean;
  onConfirmResult?: T
}
