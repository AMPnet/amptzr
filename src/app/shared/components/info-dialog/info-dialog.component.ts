import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'
import {BehaviorSubject} from 'rxjs'

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoDialogComponent implements OnInit {
  iconType = DialogIcon

  private dataSub = new BehaviorSubject<InfoDialogData>({
    icon: DialogIcon.INFO,
    title: '',
    message: '',
    confirm_text: 'OK',
    cancel_text: 'Cancel',
    cancelable: true,
  })
  data$ = this.dataSub.asObservable()

  constructor(@Inject(MAT_DIALOG_DATA) @Optional() public data: InfoDialogData,
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

  confirm(): void {
    this.dialogRef.close({confirmed: true} as InfoDialogResponse)
  }

  cancel(): void {
    this.dialogRef.close({confirmed: false} as InfoDialogResponse)
  }
}

export interface InfoDialogData {
  icon: DialogIcon
  title: string;
  message: string;
  confirm_text: string;
  cancel_text: string;
  cancelable: boolean;
}

export enum DialogIcon {
  INFO, ERROR
}

export interface InfoDialogResponse {
  confirmed: boolean;
}
