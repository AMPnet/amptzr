import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core'
import {BehaviorSubject} from 'rxjs'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'
import {LoadingDialogData} from '../loading-dialog.component'

@Component({
  selector: 'app-loading-dialog-approval',
  templateUrl: './loading-dialog-approval.component.html',
  styleUrls: ['./loading-dialog-approval.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingDialogApprovalComponent implements OnInit {
  private dataSub = new BehaviorSubject<LoadingDialogData>({
    title: 'Waiting for approval...',
    message: '',
  })
  data$ = this.dataSub.asObservable()

  constructor(@Inject(MAT_DIALOG_DATA) @Optional() public data: LoadingDialogData,
              @Optional() private dialogRef: MatDialogRef<LoadingDialogApprovalData>) {
  }

  ngOnInit(): void {
    if (!this.data) {
      return
    }

    this.dataSub.next({
      title: this.data.title || this.dataSub.value.title,
      message: this.data.message || this.dataSub.value.message,
    })
  }
}

export interface LoadingDialogApprovalData {
  title: string;
  message: string;
}
