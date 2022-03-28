import {Directive, ElementRef, Renderer2} from '@angular/core'

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({selector: 'img'})
export class LazyImgDirective {
  constructor(private renderer: Renderer2,
              private element: ElementRef<HTMLImageElement>) {
    if ('loading' in HTMLImageElement.prototype) {
      this.renderer.setAttribute(this.element.nativeElement, 'loading', 'lazy')
    }
  }
}
