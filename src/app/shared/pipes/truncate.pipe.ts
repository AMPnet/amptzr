import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 25, completeWords = false, truncateInside = false, ellipsis = '...') {
    if (truncateInside) {
      if (value.length > limit) {
        return `${value.substr(0, limit / 2)}${ellipsis}${value.substr(value.length - limit / 2)}`
      }

      return value
    }

    if (completeWords) {
      if (value.length > limit) {
        limit = value.substr(0, limit).lastIndexOf(' ')
        return `${value.substr(0, limit)}${ellipsis}`
      }

      return value
    }

    return value
  }
}
