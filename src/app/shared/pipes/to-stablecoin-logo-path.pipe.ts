import {Injectable, Pipe, PipeTransform} from '@angular/core'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'toStablecoinLogoPath',
})
export class ToStablecoinLogoPathPipe implements PipeTransform {
  constructor() {
  }

  transform(value: any): any {
    switch (value) {
      case 'USDC':
        return '/assets/usdc.png'
      default:
        return '/assets/coin_128x128.png'
    }
  }
}
