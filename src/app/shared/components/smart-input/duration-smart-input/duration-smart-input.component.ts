import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs'

@Component({
  selector: 'app-duration-smart-input',
  templateUrl: './duration-smart-input.component.html',
  styleUrls: ['./duration-smart-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DurationSmartInputComponent {

  durationInputForm = new FormGroup({
    years: new FormControl('', []),
    months: new FormControl('', []),
    days: new FormControl('', []),
    hours: new FormControl('', []),
    minutes: new FormControl('', []),
    seconds: new FormControl('', [])
  })

  @Input() selectedSub?: BehaviorSubject<string | null>

  MINUTE_X = 60
  HOUR_X = this.MINUTE_X * 60
  DAY_X = this.HOUR_X * 24
  MONTH_X = this.DAY_X * 30
  YEAR_X = this.MONTH_X * 12

  calculatedTimeInSeconds$ = this.durationInputForm.valueChanges.pipe(
    map(_ => {
      const formControls = this.durationInputForm.controls
      return (formControls.years.value * this.YEAR_X)
        + (formControls.months.value * this.MONTH_X)
        + (formControls.days.value * this.DAY_X)
        + (formControls.hours.value * this.HOUR_X)
        + (formControls.minutes.value * this.MINUTE_X)
        + formControls.seconds.value as number
    })
  )

  onConfirmClicked(durationInSeconds: number) {
    this.selectedSub?.next(durationInSeconds.toString())
  }

}
