import {Injectable, Pipe, PipeTransform} from '@angular/core'
import {WithStatus} from '../utils/observables'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'unwrapStatus',
})
export class UnwrapStatusPipe implements PipeTransform {
  transform<T>(withStatus: WithStatus<T> | null): T | string {
    if (!withStatus) {
      return ''
    } else if (withStatus.loading) {
      return '⌛'
    } else if (withStatus.value) {
      return withStatus.value
    } else if (withStatus.error) {
      console.error(withStatus.error)
      return '❌'
    } else {
      return ''
    }
  }
}
