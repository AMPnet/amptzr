import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core'
import {BehaviorSubject} from 'rxjs'
import {LoadingDialogData} from '../loading-dialog.component'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'

@Component({
  selector: 'app-loading-dialog-transaction',
  templateUrl: './loading-dialog-transaction.component.html',
  styleUrls: ['./loading-dialog-transaction.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingDialogTransactionComponent implements OnInit {
  private dataSub = new BehaviorSubject<LoadingDialogData>({
    title: 'Processing...',
    message: '',
  })
  data$ = this.dataSub.asObservable()

  constructor(@Inject(MAT_DIALOG_DATA) @Optional() public data: LoadingDialogData,
              @Optional() private dialogRef: MatDialogRef<LoadingDialogTransactionData>) {
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

export interface LoadingDialogTransactionData {
  title: string;
  message: string;
}
