import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {BehaviorSubject, EMPTY, from, Observable, of} from 'rxjs'
import {catchError, delay, tap} from 'rxjs/operators'

@Component({
  selector: 'app-value-copy',
  templateUrl: './value-copy.component.html',
  styleUrls: ['./value-copy.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueCopyComponent implements OnInit {
  @Input() value = ''
  @Input() delay = 1000
  @Input() textReady = ''
  @Input() textCopied = ''

  stateType = State
  stateTexts!: { [key in State]: string }

  stateSub = new BehaviorSubject<State>(State.READY)
  state$ = this.stateSub.asObservable()

  constructor() {
  }

  ngOnInit() {
    this.stateTexts = {
      [State.READY]: this.textReady,
      [State.COPIED]: this.textCopied,
    }
  }

  click(): Observable<unknown> {
    return from(navigator.clipboard.writeText(this.value)).pipe(
      catchError(() => of(this.fallbackCopy())),
      tap(() => this.stateSub.next(State.COPIED)),
      delay(this.delay),
      tap(() => this.stateSub.next(State.READY)),
      catchError(() => EMPTY),
    )
  }

  private fallbackCopy() {
    const selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    selBox.value = this.value || ''
    document.body.appendChild(selBox)
    selBox.focus()
    selBox.select()
    document.execCommand('copy')
    document.body.removeChild(selBox)
  }
}

enum State {
  READY = 1,
  COPIED = 2
}
