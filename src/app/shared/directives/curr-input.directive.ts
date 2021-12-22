import {Directive, ElementRef, ExistingProvider, forwardRef, HostBinding, HostListener, Renderer2} from '@angular/core'
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms'

export const CURR_INPUT_DIRECTIVE_VALUE_ACCESSOR: ExistingProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CurrInputDirective),
  multi: true,
}

@Directive({
  selector: 'input[appCurrInput]',
  providers: [CURR_INPUT_DIRECTIVE_VALUE_ACCESSOR],
})
export class CurrInputDirective implements ControlValueAccessor {
  constructor(private el: ElementRef,
              private renderer: Renderer2) {
  }

  private onChange!: Function
  private onTouched!: Function

  @HostListener('input', ['$event.target.value']) onInput(value: any) {
    this.handleInput(value)
  }

  @HostListener('blur', ['$event']) onBlur(_e: any) {
    this.onTouched()
  }

  @HostBinding() disabled = false
  @HostBinding('attr.inputmode') inputMode = 'decimal'
  @HostBinding('autocomplete') autoComplete = 'off'
  @HostBinding('type') type = 'text'
  @HostBinding('pattern') pattern = '^[0-9]*[.,]?[0-9]*$'
  @HostBinding('placeholder') placeholder = '0.0'
  @HostBinding('minlength') minlength = '1'
  @HostBinding('maxlength') maxlength = '79'
  @HostBinding('spellcheck') spellcheck = 'false'

  handleInput(value: any): void {
    this.writeValue(value)
    this.onChange(Number(this.clearValue(value)))
  }

  private clearValue(value: any): string {
    let clearedValue = String(value)
      .replace(',', '.')
      .replace(/[^.\d]/g, '') // remove letters
      .replace(/^0+(?=\d)/, '') // remove leading zeros

    clearedValue = clearedValue.split('') // remove extra dots
      .filter((val, i, str) => val !== '.' || str.indexOf('.') === i).join('')

    return clearedValue
  }

  writeValue(value: any): void {
    this.renderer.setProperty(this.el.nativeElement, 'value', this.clearValue(value))
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled
    this.renderer.setProperty(this.el.nativeElement, 'disabled', isDisabled)
  }
}
