import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {finalize} from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'button[app-action-button]',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionButtonComponent implements OnInit, OnDestroy {
  loading = false;
  sub: Subscription | undefined;

  @Input() text = '';
  @Input() loadingText = '';
  @Input() class = '';
  @Input() disabled = false;

  @Input() onClick: () => Observable<unknown> = () => EMPTY;

  constructor(private changeRef: ChangeDetectorRef) {
  }

  @HostBinding('class') get buttonClass(): string {
    return this.class || 'btn btn-primary';
  }

  @HostBinding('disabled') get buttonDisabled(): boolean {
    return this.disabled || this.loading;
  }

  @HostListener('click')
  click(): void {
    if (this.buttonDisabled) {
      return;
    }

    this.loading = true;
    this.sub = this.onClick().pipe(finalize(() => {
      this.loading = false;
      this.changeRef.markForCheck();
    })).subscribe();
  }

  ngOnInit(): void {
    this.loadingText ||= this.text;
  }

  ngOnDestroy(): void {
    if (this.sub !== undefined && !this.sub.closed) {
      this.sub.unsubscribe();
    }
  }
}
