import {Injectable, Pipe, PipeTransform} from '@angular/core'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'addrShort',
})
export class AddrShortPipe implements PipeTransform {
  constructor() {
  }

  transform(value: any): any {
    if (!value) {
      return ''
    }

    const address = String(value).toLowerCase()

    return `${address.substr(0, 6)}...${address.substr(address.length - 4, 4)}`
  }
}
