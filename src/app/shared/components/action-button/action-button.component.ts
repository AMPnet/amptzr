import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ɵmarkDirty,
} from '@angular/core'
import {EMPTY, Observable, Subscription} from 'rxjs'

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[app-action-button]',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonComponent implements OnInit, OnDestroy {
  loading = false
  sub: Subscription | undefined

  @Input() text = ''
  @Input() loadingText = ''
  @Input() class = ''
  @Input() disabled = false
  @Input() iconPath = ''

  @ContentChild('content') content!: TemplateRef<any>
  @ContentChild('loadingContent') loadingContent!: TemplateRef<any>

  @Input() onClick: () => Observable<unknown> = () => EMPTY

  constructor() {
  }

  @HostBinding('class') get buttonClass(): string {
    return this.class || ''
  }

  @HostBinding('disabled') get buttonDisabled(): boolean {
    return this.disabled || this.loading
  }

  @HostListener('click')
  click(): void {
    if (this.buttonDisabled) {
      return
    }

    this.loading = true
    this.sub = this.onClick().subscribe({
      error: () => {
        this.loading = false
        ɵmarkDirty(this)
      },
      complete: () => {
        this.loading = false
        ɵmarkDirty(this)
      },
    })
  }

  ngOnInit(): void {
    this.loadingText ||= this.text
  }

  ngOnDestroy(): void {
    if (this.sub !== undefined && !this.sub.closed) {
      this.sub.unsubscribe()
    }
  }
}
