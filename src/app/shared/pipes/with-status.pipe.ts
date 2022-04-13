import {Injectable, Pipe, PipeTransform} from '@angular/core'
import {Observable} from 'rxjs'
import {withStatus, WithStatus} from '../utils/observables'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'withStatus',
})
export class WithStatusPipe implements PipeTransform {
  constructor() {
  }

  transform<T>(value: Observable<T>): Observable<WithStatus<T>> {
    return withStatus(value)
  }
}
