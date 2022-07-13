import { Directive, forwardRef, OnInit } from '@angular/core'
import {
  CurrencyMaskConfig,
  CurrencyMaskDirective as NGXDirective,
  CurrencyMaskInputMode,
} from 'ngx-currency'
import { NG_VALUE_ACCESSOR } from '@angular/forms'

export const CURRENCYMASKDIRECTIVE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CurrencyMaskDirective),
  multi: true,
}

@Directive({
  selector: '[appCurrencyMask]',
  providers: [CURRENCYMASKDIRECTIVE_VALUE_ACCESSOR],
})
export class CurrencyMaskDirective extends NGXDirective implements OnInit {
  public optionsTemplate: CurrencyMaskConfig = {
    align: 'right',
    allowNegative: false,
    allowZero: true,
    decimal: '.',
    precision: 2,
    prefix: '$',
    suffix: '',
    thousands: ',',
    nullable: false,
    inputMode: CurrencyMaskInputMode.FINANCIAL,
  }
}
