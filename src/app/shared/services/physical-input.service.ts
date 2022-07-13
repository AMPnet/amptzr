import { Injectable } from '@angular/core'
import { fromEvent, merge, Observable } from 'rxjs'
import { filter, map, shareReplay } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class PhysicalInputService {
  constructor() {}

  keyDownUp$ = merge(
    fromEvent(document, 'keydown'),
    fromEvent(document, 'keyup')
  )

  altKeyActive$: Observable<boolean> = this.keyDownUp$.pipe(
    filter((e) => (e as KeyboardEvent).key === 'Alt'),
    map(
      (e) =>
        e.type === 'keydown' ||
        (e.type === 'keyup' && (e as KeyboardEvent).shiftKey)
    ),
    shareReplay(1)
  )
}
