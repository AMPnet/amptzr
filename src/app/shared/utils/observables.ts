import {combineLatest, concat, interval, Observable, of} from 'rxjs'
import {catchError, map, startWith} from 'rxjs/operators'

export function withInterval<T>(observable$: Observable<T>, offset: number): Observable<T> {
  return combineLatest([
    observable$, interval(offset).pipe(startWith(0)),
  ]).pipe(
    map(([result, _]) => result)
  )
}

export function withStatus<T>(observable$: Observable<T>): Observable<WithStatus<T>> {
  return concat(
    of({loading: true} as WithStatus<T>),
    observable$.pipe(
      map(val => ({loading: false, value: val} as WithStatus<T>)),
      catchError(err => of({loading: false, error: err} as WithStatus<T>)),
    )
  )
}

export interface WithStatus<T> {
  loading: boolean;
  value?: T;
  error?: any
}
