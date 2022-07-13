import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../../environments/environment'
import { IPFSAddResult, IPFSApi } from './ipfs.service.types'
import { IpfsPinataApiService } from './ipfs-pinata-api.service'
import { IPFSCampaign } from '../../../../../types/ipfs/campaign'
import { IPFSIssuer } from '../../../../../types/ipfs/issuer'
import { IPFSAsset } from '../../../../../types/ipfs/asset'
import { CID } from 'ipfs-http-client'

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

  toCID(value: any): CID | undefined {
    try {
      const cid = CID.parse(value)

      if (CID.asCID(cid)) return cid
    } catch (_e) {
      return undefined
    }

    return undefined
  }

  get<T>(hash: string): Observable<T> {
    const cid = this.toCID(hash)

    return cid ? this.http.get<T>(this.getURL(cid.toString())) : of(<T>{})
  }

  getURL(hash: string): string {
    return `${environment.ipfs.gatewayURL}/ipfs/${hash}`
  }

  addFile(file: File): Observable<IPFSAddResult> {
    return this.IPFSApiService.addFile(file)
  }

  addText(content: string): Observable<IPFSAddResult> {
    return this.addObject<IPFSText>({ content })
  }

  addObject<ipfsObject>(data: ipfsObject): Observable<IPFSAddResult> {
    return this.IPFSApiService.addObject(data as unknown as object)
  }
}

export interface IPFSText {
  content: string
}

type ipfsObject = IPFSAsset | IPFSCampaign | IPFSIssuer | IPFSText
