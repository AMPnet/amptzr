import {BehaviorSubject, concat, MonoTypeOperatorFunction, Observable, of, timer} from 'rxjs'
import {catchError, map, switchMap} from 'rxjs/operators'

export function withInterval<T>(observable$: Observable<T>, offset: number): Observable<T> {
  return timer(0, offset).pipe(
    switchMap(() => observable$),
  )
}

export function withStatus<T>(
  source: Observable<T>, opts?: Partial<Options>,
): Observable<WithStatus<T>> {
  const refreshSub = new BehaviorSubject<void>(undefined)
  const stream: Observable<WithStatus<T>>[] = []

  if (!opts?.hideLoading) {
    stream.push(of({loading: true} as WithStatus<T>))
  }

  stream.push(
    source.pipe(
      map(value => ({value})),
      catchError(error => of({error})),
    ),
  )

  return new Observable(subscriber => {
    const subscription = refreshSub.asObservable().pipe(
      switchMap(() => concat(...stream)),
    ).subscribe({
      next: valueWithStatus => {
        subscriber.next({
          ...valueWithStatus,
          refresh: () => refreshSub.next(),
        })
      },
      error: err => subscriber.error(err),
      complete: () => subscriber.complete(),
    })

    return () => {
      refreshSub.complete()
      subscription.unsubscribe()
    }
  })
}

export function switchMapTap<T>(next: (value: T) => Observable<unknown>): MonoTypeOperatorFunction<T> {
  return switchMap(source => next(source).pipe(
    map(() => source),
  ))
}

export interface WithStatus<T> {
  loading?: boolean;
  value?: T;
  error?: unknown;
  refresh?: () => void;
}

interface Options {
  hideLoading: boolean
}
