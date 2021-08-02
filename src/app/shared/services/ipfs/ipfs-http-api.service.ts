import {create as ipfsCreate} from 'ipfs-http-client'
import {from, Observable} from 'rxjs'
import {IPFS} from 'ipfs-core-types'
import {environment} from '../../../../environments/environment'
import {IPFSAddResult, IPFSApi} from './ipfs.service.types'

export class IpfsHttpApiService implements IPFSApi {
  client: IPFS

  constructor() {
    this.client = ipfsCreate({
      url: environment.ipfs.apiURL,
    })
  }

  addFile(file: File): Observable<IPFSAddResult> {
    return from(this.client.add(file))
  }

  addObject(data: object): Observable<IPFSAddResult> {
    return from(this.client.add(Buffer.from(JSON.stringify(data))))
  }
}
