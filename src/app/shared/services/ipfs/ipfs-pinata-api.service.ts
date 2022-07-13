import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../../environments/environment'
import { map } from 'rxjs/operators'
import { IPFSAddResult, IPFSApi } from './ipfs.service.types'

export class IpfsPinataApiService implements IPFSApi {
  constructor(private http: HttpClient) {}

  addFile(file: File): Observable<IPFSAddResult> {
    const formData = new FormData()
    formData.append('file', file, file.name)

    return this.pinFileToIPFS(formData)
  }

  addObject(data: object): Observable<IPFSAddResult> {
    const formData = new FormData()
    formData.append(
      'file',
      new Blob([JSON.stringify(data)], {
        type: 'application/json',
      }),
      'data.json'
    )

    return this.pinFileToIPFS(formData)
  }

  private pinFileToIPFS(formData: FormData): Observable<IPFSAddResult> {
    return this.http
      .post<PinataPinResponse>(
        `${environment.ipfs.pinataApiURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            // TODO: remove test JWT token and implement proper backend authorization
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmYjQzOWVjOC0wZmFhLTQzYjgtOGM1OS1kY2MyM2VlYmIwZTMiLCJlbWFpbCI6ImV1Z2VuQGFtcG5ldC5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2V9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJhMmRmNGJhYzZiZDhkNmQxYmFlYiIsInNjb3BlZEtleVNlY3JldCI6IjIzNWYzODg1MmYxNWExODY2YWJiYTc1Y2I5OTlhNWU4ZjAwZjUxMWRlNDQwNGIyOWYyZjgxNzRjYzhhMWI3OTkiLCJpYXQiOjE2Mjc4OTkzODl9.3BRf9auEMW4evy6G72Y_tHOytKD_E0UYf8T_11DJfx4',
          },
        }
      )
      .pipe(map((res) => ({ path: res.IpfsHash, size: res.PinSize })))
  }
}

interface PinataPinResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: Date
}
