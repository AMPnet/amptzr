import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {HttpClient} from '@angular/common/http'
import {environment} from '../../../../environments/environment'
import {IPFSAddResult, IPFSApi} from './ipfs.service.types'
import {IpfsPinataApiService} from './ipfs-pinata-api.service'
import {IPFSCampaign} from '../../../../../types/ipfs/campaign'
import {IPFSIssuer} from '../../../../../types/ipfs/issuer'
import {IPFSAsset} from '../../../../../types/ipfs/asset'

@Injectable({
  providedIn: 'root',
})
export class IpfsService {
  IPFSApiService: IPFSApi

  constructor(private http: HttpClient) {
    this.IPFSApiService = new IpfsPinataApiService(http)

    // Example of using the default IPFS HTTP Service
    // this.IPFSApiService = new IpfsHttpApiService()
  }

  get<T>(cid: string): Observable<T> {
    return this.http.get<T>(this.getURL(cid))
  }

  getURL(cid: string): string {
    return `${environment.ipfs.gatewayURL}/ipfs/${cid}`
  }

  addFile(file: File): Observable<IPFSAddResult> {
    return this.IPFSApiService.addFile(file)
  }

  addObject<ipfsObject>(data: ipfsObject): Observable<IPFSAddResult> {
    return this.IPFSApiService.addObject(data as unknown as object)
  }
}

type ipfsObject = IPFSAsset | IPFSCampaign | IPFSIssuer
