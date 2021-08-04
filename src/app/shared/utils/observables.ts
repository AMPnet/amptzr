import {combineLatest, concat, interval, Observable, of} from 'rxjs'
import {catchError, map, startWith} from 'rxjs/operators'

export function withInterval<T>(observable$: Observable<T>, offset: number): Observable<T> {
  return combineLatest([
    observable$, interval(offset).pipe(startWith(0)),
  ]).pipe(
    map(([result, _]) => result),
  )
}

export function withStatus<T>(observable$: Observable<T>, opts?: Options): Observable<WithStatus<T>> {
  const stream: Observable<WithStatus<T>>[] = []

  if (!opts?.hideLoading) {
    stream.push(of({loading: true} as WithStatus<T>))
  }

  stream.push(
    observable$.pipe(
      map(val => ({loading: false, value: val} as WithStatus<T>)),
      catchError(err => of({loading: false, error: err} as WithStatus<T>)),
    ),
  )

  return concat(
    ...stream,
  )
}

export interface WithStatus<T> {
  loading: boolean;
  value?: T;
  error?: unknown
}

interface Options {
  hideLoading: boolean
}
