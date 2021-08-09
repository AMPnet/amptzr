import {Observable} from 'rxjs'

export interface IPFSApi {
  addObject(data: object): Observable<IPFSAddResult>

  addFile(file: File): Observable<IPFSAddResult>
}

export interface IPFSAddResult {
  path: string
  size: number
}
