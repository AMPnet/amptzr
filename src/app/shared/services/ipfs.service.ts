import {Injectable} from '@angular/core'
import {create as ipfsCreate} from 'ipfs-http-client'
import {environment} from '../../../environments/environment'
import {from, Observable} from 'rxjs'
import {HttpClient} from '@angular/common/http'
import {IPFS} from 'ipfs-core-types'
import {AddResult} from 'ipfs-core-types/src/root'

@Injectable({
  providedIn: 'root',
})
export class IpfsService {
  client: IPFS

  constructor(private http: HttpClient) {
    this.client = ipfsCreate({url: environment.ipfs.apiURL})
  }

  get<T>(cid: string): Observable<T> {
    return this.http.get<T>(`${environment.ipfs.gatewayURL}/ipfs/${cid}`)
  }

  addJSON<T>(payload: T): Observable<AddResult> {
    return from(this.client.add(Buffer.from(JSON.stringify(payload))))
  }
}
