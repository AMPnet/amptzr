import {Injectable, Pipe, PipeTransform} from '@angular/core'
import {IpfsService, IPFSText} from '../services/ipfs/ipfs.service'
import {Observable, of} from 'rxjs'
import {withStatus, WithStatus} from '../utils/observables'
import {map} from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'toTextIPFS',
})
export class ToTextIpfsPipe implements PipeTransform {
  constructor(private ipfsService: IpfsService) {
  }

  transform(value: any): Observable<WithStatus<string>> {
    const cid = this.ipfsService.toCID(value)

    if (!cid) {
      return of({loading: false, value: value})
    }

    return withStatus(this.ipfsService.get<IPFSText>(cid.toString()).pipe(
      map(res => res.content),
    ))
  }
}
