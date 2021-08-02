import {Injectable, Pipe, PipeTransform} from '@angular/core'
import {CID} from 'ipfs-http-client'
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
    try {
      const cid = new CID(value)
      if (CID.isCID(cid)) {
        return this.ipfsService.getURL(cid.toString())
      }
    } catch (_e) {
      return value
    }

    return value
  }
}
