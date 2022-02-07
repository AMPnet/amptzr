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
      default:
        return '/assets/usdc.png'
    }
  }
}
