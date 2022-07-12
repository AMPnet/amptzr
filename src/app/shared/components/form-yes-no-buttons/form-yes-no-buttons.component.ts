import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  selector: 'app-form-yes-no-buttons',
  templateUrl: './form-yes-no-buttons.component.html',
  styleUrls: ['./form-yes-no-buttons.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FormYesNoButtonsComponent,
    },
  ],
})
export class FormYesNoButtonsComponent implements ControlValueAccessor {
  value?: boolean

  onChange = (value: boolean) => {}
  onTouched = () => {}
  touched = false
  disabled = false

  constructor() {}

  setValue(value: boolean) {
    if (this.value !== value) {
      this.markAsTouched()

      if (!this.disabled) {
        this.value = value
        this.onChange(this.value)
      }
    }
  }

  writeValue(value: boolean): void {
    this.value = value
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched()
      this.touched = true
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled
  }
}
