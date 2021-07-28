import {Injectable, Pipe, PipeTransform} from '@angular/core'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'portfolioProjectState',
})
export class PortfolioProjectState implements PipeTransform {
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
