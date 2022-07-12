import {
  Directive,
  ElementRef,
  ExistingProvider,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { BigNumber } from 'ethers'
import { ConversionService } from '../services/conversion.service'

export const BIGNUMBER_INPUT_DIRECTIVE_VALUE_ACCESSOR: ExistingProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => BigNumberInputDirective),
  multi: true,
}

@Directive({
  selector: 'input[appBigNumberInput]',
  providers: [BIGNUMBER_INPUT_DIRECTIVE_VALUE_ACCESSOR],
})
export class BigNumberInputDirective implements ControlValueAccessor {
  @Input() bigNumberType: 'stablecoin' | 'token' | 'tokenPrice' = 'stablecoin'
  @Input() tokenPrecision = 18

  previousValue: string

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private conversion: ConversionService
  ) {
    this.previousValue = this.el.nativeElement.value
  }

  private onChange!: Function
  private onTouched!: Function

  @HostListener('input', ['$event.target.value']) onInput(value: any) {
    this.handleInput(value)
  }

  @HostListener('blur', ['$event']) onBlur(_e: any) {
    this.onTouched()
  }

  @HostBinding('attr.inputmode') inputMode = 'decimal'
  @HostBinding('autocomplete') autoComplete = 'off'
  @HostBinding('type') type = 'text'
  @HostBinding('pattern') pattern = '^[0-9]*[.,]?[0-9]*$'
  @HostBinding('placeholder') placeholder = '0'
  @HostBinding('minlength') minlength = '1'
  @HostBinding('maxlength') maxlength = '79'
  @HostBinding('spellcheck') spellcheck = 'false'

  handleInput(value: any): void {
    const clearedValue = this.clearValue(value)

    let bigNumberValue: BigNumber
    try {
      bigNumberValue = this.toBigNumberValue(clearedValue || '0')
    } catch (_e) {
      this.writeValue(this.previousValue)
      return
    }

    this.writeValue(clearedValue)
    this.onChange(this.parseValue(bigNumberValue))

    this.previousValue = clearedValue
  }

  private clearValue(value: any): string {
    let clearedValue = String(value)
      .replace(',', '.')
      .replace(/[^.\d]/g, '') // remove letters
      .replace(/^0+(?=\d)/, '') // remove leading zeros

    clearedValue = clearedValue
      .split('') // remove extra dots
      .filter((val, i, str) => val !== '.' || str.indexOf('.') === i)
      .join('')

    return clearedValue
  }

  private toBigNumberValue(value: string): BigNumber {
    switch (this.bigNumberType) {
      case 'stablecoin':
        return this.conversion.toStablecoin(value)
      case 'token':
        return this.conversion.toToken(value, this.tokenPrecision)
      case 'tokenPrice':
        return this.conversion.toTokenPrice(value)
    }
  }

  private parseValue(value: BigNumber): string {
    switch (this.bigNumberType) {
      case 'stablecoin':
        return this.conversion.parseStablecoin(value)
      case 'token':
        return this.conversion.parseToken(value, this.tokenPrecision)
      case 'tokenPrice':
        return this.conversion.parseTokenPrice(value)
    }
  }

  writeValue(value: any): void {
    this.renderer.setProperty(this.el.nativeElement, 'value', value)
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean) {
    // Commented out due to disabled issue with validations.
    // To set field as disabled, use [attr.disabled]="true" on an input field
    // that has reactive form validations. In other case, e.g. when setting
    // disabled directly, the form doesn't validate the input at all.
    //
    // this.disabled = ''
    // this.renderer.setProperty(this.el.nativeElement, 'disabled', isDisabled)
  }
}
