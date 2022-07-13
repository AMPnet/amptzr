import { Directive, forwardRef, OnInit } from '@angular/core'
import {
  PercentageMaskConfig,
  PercentageMaskDirective as NGXDirective,
  PercentageMaskInputMode,
} from 'fx-percentage'
import { NG_VALUE_ACCESSOR } from '@angular/forms'

export const PERCENTAGEMASKDIRECTIVE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PercentageMaskDirective),
  multi: true,
}

@Directive({
  selector: '[appPercentageMask]',
  providers: [PERCENTAGEMASKDIRECTIVE_VALUE_ACCESSOR],
})
export class PercentageMaskDirective extends NGXDirective implements OnInit {
  public optionsTemplate: PercentageMaskConfig = {
    align: 'right',
    allowNegative: false,
    allowZero: true,
    decimal: '.',
    precision: 0,
    prefix: '',
    suffix: '%',
    thousands: ',',
    nullable: false,
    inputMode: PercentageMaskInputMode.NATURAL,
  }
}
