import { Directive, ElementRef, HostListener } from '@angular/core'

@Directive({
  selector: 'input[appDateMask]',
})
export class DateMaskDirective {
  constructor(private element: ElementRef) {}

  @HostListener('focus')
  handleFocus() {
    this.element.nativeElement.type = 'date'
  }

  @HostListener('blur')
  handleBlur() {
    if (!this.element.nativeElement.value) {
      this.element.nativeElement.type = 'text'
    }
  }
}
