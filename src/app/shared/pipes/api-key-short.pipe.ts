import { Injectable, Pipe, PipeTransform } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'apiKeyShort',
})
export class ApiKeyShortPipe implements PipeTransform {
  constructor() {}

  transform(value: any): any {
    if (!value) {
      return ''
    }

    return value.split('.')[0]
  }
}
