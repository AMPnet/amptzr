import {Injectable, Pipe, PipeTransform} from '@angular/core'
import {from, Observable, of} from 'rxjs'
import {catchError, map} from 'rxjs/operators'
import {SessionQuery} from '../../session/state/session.query'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'blockTime',
})
export class BlockTimePipe implements PipeTransform {
  constructor(private sessionQuery: SessionQuery) {
  }

  transform(value: any): Observable<number | undefined> {
    if (!value) return of(undefined)

    return from(this.sessionQuery.provider.getBlock(Number(value))).pipe(
      map(block =>
        block.timestamp * 1000, // normalize to millis
      ),
      catchError(() => of(undefined)),
    )
  }
}
