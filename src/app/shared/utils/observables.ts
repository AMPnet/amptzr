import {concat, Observable, of, timer} from 'rxjs'
import {catchError, map, switchMap} from 'rxjs/operators'

export function withInterval<T>(observable$: Observable<T>, offset: number): Observable<T> {
  return timer(0, offset).pipe(
    switchMap(() => observable$),
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
