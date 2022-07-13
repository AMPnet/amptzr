import { VercelRequest, VercelResponse } from '@vercel/node'
import { HttpClient, HttpXhrBackend } from '@angular/common/http'
import { catchError, tap, timeout } from 'rxjs/operators'
import { EMPTY, firstValueFrom } from 'rxjs'
// @ts-ignore
import { XMLHttpRequest } from 'xmlhttprequest'
import { IpfsService } from '../../src/app/shared/services/ipfs/ipfs.service'
import { IPFSIssuer } from '../../types/ipfs/issuer'

const httpClient = new HttpClient(
  new HttpXhrBackend({ build: () => new XMLHttpRequest() })
)
const ipfsService = new IpfsService(httpClient)

export default async (request: VercelRequest, response: VercelResponse) => {
  const { hash } = request.query

  // TODO: this doesn't work in Vercel environment anymore.
  //  fix it by extracting IpfsService logic.
  return firstValueFrom(
    ipfsService.get<IPFSIssuer>(hash as string).pipe(
      tap((issuer) => response.status(200).send(issuer)),
      catchError((_err) => {
        response.status(200).send({})
        return EMPTY
      }),
      timeout(5000)
    )
  )
}
