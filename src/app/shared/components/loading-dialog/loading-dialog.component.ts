import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core'
import {BehaviorSubject} from 'rxjs'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'

@Component({
  selector: 'app-loading-dialog',
  templateUrl: './loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingDialogComponent implements OnInit {
  private dataSub = new BehaviorSubject<LoadingDialogData>({
    title: '',
    message: '',
  })
  data$ = this.dataSub.asObservable()

  constructor(@Inject(MAT_DIALOG_DATA) @Optional() public data: LoadingDialogData,
              @Optional() private dialogRef: MatDialogRef<LoadingDialogComponent>) {
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
}

export interface LoadingDialogData {
  title: string;
  message: string;
}
