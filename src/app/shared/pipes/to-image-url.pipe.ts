import {Injectable, Pipe, PipeTransform} from '@angular/core'
import {IpfsService} from '../services/ipfs/ipfs.service'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'toImageURL',
})
export class ToImageUrlPipe implements PipeTransform {
  constructor(private ipfsService: IpfsService) {
  }

  transform(value: any): any {
    const cid = this.ipfsService.toCID(value)

    return cid ? this.ipfsService.getURL(cid.toString()) : value
  }
}
